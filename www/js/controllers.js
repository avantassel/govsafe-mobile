angular.module('govsafe.controllers', [])

    .controller('AppCtrl', function ($scope, $state) {

        //get user for sidebar logic
        var auser = window.localStorage.getItem('accela_user');

        if(auser)
            $scope.user = JSON.parse(auser);
        
    })
    
    .controller('LogoutCtrl', function ($scope, $state) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('accela_user');
        $state.go('app.login');
    })

    .controller('LoginCtrl', function ($scope, $state, $location, $http, API_VARS) {

        // window.localStorage.setItem('token','lNRDT0VcQPKNS4rw6jGJky3OUlXHOGJFD3SGzyMpE-SzfGhbGmkLlTpzXOh5lFHFozq_GLnHhGa_8awORD-OV-bqtWOpxT_HSfqM5DcMFMMUREmU5lG7xEFt0grjFZFIcfnp8fW53AiTRNUrCoq4sRzwRYQLtL4dsz4lpQlKYh4mIyeJoEVl136yd0jEvCBIFaJqW4MoppS7jTm94PBu1uCKI5-UXcV3jS1tY_fmceKzqNhalocpqlu61lKdcqwlBkuFcb-tD3GGD8ATEWYmv7Pg1BxrKSK3SCb6znA1ILcp9jrtNhHaMzvF_KnAgRtpRWMb7lt7ENRpHwiWVkWZWuAyNXhJsGRbhGHRrotDk0hGIWjfvBrlJOEb0cJ300A0727Ujn_y4md-1pcwPrqcyw2');
        $scope.access_token = window.localStorage.getItem('token');

        // {
        //     "result": {
        //         "id": "7e708384-77d1-4f7e-a03e-170fbed64f31",
        //         "loginName": "avantassel@gmail.com",
        //         "email": "avantassel@gmail.com",
        //         "firstName": "Andrew",
        //         "lastName": "Tassel",
        //         "streetAddress": "",
        //         "avatarUrl": "https://accelauserprod.blob.core.windows.net/cloud-user-profile-images/7e708384-77d1-4f7e-a03e-170fbed64f31_normal.png"
        //     }
        // }

        $scope.GetUserData = function() {
        
            $http.defaults.headers.get = {};
            $http.defaults.headers.get['Content-Type'] = 'application/json';
            $http.defaults.headers.get['Accept'] = 'application/json';
            $http.defaults.headers.get['Authorization'] = $scope.access_token;
            $http.defaults.headers.get['x-accela-appid'] = API_VARS.client_id;

            $http({method: "get", url: API_VARS.host+"/civicid/profile?lang=en"})
                .success(function(data) {

                    if(data.result){
                        data.result.name = data.result.firstName+''+data.result.lastName;
                        window.localStorage.setItem('accela_user',JSON.stringify(data.result));
                    }
                    $state.go('app.profile');

                })
                .error(function(data, status) {

                });
        };

        $scope.Login = function() {

            $scope.fireLogin = function() {

                var ref = window.open('https://auth.accela.com/oauth2/authorize?response_type=code&environment=Prod&redirect_uri=http%3A%2F%2Flocalhost%3A8100&client_id=' + API_VARS.client_id, '_blank');
                ref.addEventListener('loadstart', function(event) { 
                    if((event.url).startsWith("http://localhost:8100")) {
                        requestToken = (event.url).split("code=")[1];

                        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                        $http.defaults.headers.post['x-accela-appid'] = API_VARS.client_id;
                        $http({method: "post", url: "https://apis.accela.com/oauth2/token", data: "client_id=" + API_VARS.client_id + "&client_secret=" + API_VARS.client_secret + "&redirect_uri=http%3A%2F%2Flocalhost%3A8100" + "&grant_type=authorization_code" + "&code=" + requestToken })
                            .success(function(data) {
                                
                                //set token to LS
                                window.localStorage.setItem('token', data.access_token);
                                $scope.access_token = data.access_token;

                                $scope.GetUserData();

                            })
                            .error(function(data, status) {
                                
                                alert("ERROR2: "+ JSON.stringify(data));

                            });
                        ref.close();
                    }
                });
            };
            
            if (typeof String.prototype.startsWith != 'function') {
                String.prototype.startsWith = function (str){
                    return this.indexOf(str) == 0;
                };
            }
            $scope.fireLogin();
        };

        $scope.civicIdLogin = function () {
            if($scope.access_token)
                $scope.GetUserData();
            else
                $scope.Login();
        };

    })

    .controller('ProfileCtrl', function ($scope, $state) {
        var auser = window.localStorage.getItem('accela_user');

        if(auser)
            $scope.user = JSON.parse(auser);
        else
            $state.go('app.login');

    })

    .controller('AssistanceCtrl', function ($scope, $filter, $sce, $stateParams, $cordovaDialogs, $ionicScrollDelegate, $ionicSlideBoxDelegate, UserService) {
        
        var auser = window.localStorage.getItem('accela_user');

        if(auser)
            $scope.user = JSON.parse(auser);
        else
            $scope.user = {};

        $scope.needs = [
            {name:'Health/Medical'}
            ,{name:'Food Assistance'}
            ,{name:'Material Assistance'}
            ,{name:'Housing'}
            ,{name:'Transportation'}
            ,{name:'Clean-up/Re-building'}
            ,{name:'Financial'}
            ,{name:'Pets'}
            ,{name:'Other'}
        ];
        $scope.kids_pets = [
            {name:'1 Kid'}
            ,{name:'2 Kids'}
            ,{name:'3 Kids'}
            ,{name:'4 or more Kids'}
            ,{name:'1 Pet'}
            ,{name:'2 Pets'}
            ,{name:'3 Pets'}
            ,{name:'4 or more Pets'}
            ,{name:'Other'}
        ];
        $scope.eta = [
            {name:'I am in line now'}
            ,{name:'1 hr'}
            ,{name:'2 hrs'}
            ,{name:'3 hrs'}
            ,{name:'4 hrs'}
            ,{name:'5 hrs'}
            ,{name:'6 hrs'}
            ,{name:'Tomorrow'}
            ,{name:'Other'}
        ];
        $scope.step = 1;
        $scope.loc = ''; //loc=lat+','+lng;
        $scope.dac_selected = '';
        $scope.dac_updated = '';
        $scope.address = $sce.trustAsHtml('<i class="icon ion-loading-d"></i>');
        $scope.dacs = [{"lat":44.37086,"lng":-100.353,"name":"Andrew's Church","addr1":"117 N Central Ave","city":"PIERRE","state":"SD","zip":"57501","capacity":120,"population":11},{"lat":44.37086,"lng":-100.353,"name":"Pierre First United Methodist Church","addr1":"117 N Central Ave","city":"PIERRE","state":"SD","zip":"57501","capacity":120,"population":11}];
        $scope.refreshText = 'Pull to get your location...';
        
        $scope.locateUser = function(refresh){
            UserService.locateUser(refresh).then(function(data){
                $scope.loc = data.loc.latitude+','+data.loc.longitude;
                $scope.address = data.address;
                
                //save user vars
                $scope.user.address = data.address;
                $scope.user.loc = data.loc.latitude+','+data.loc.longitude;

                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });    
        }

        $scope.getDAC = function(refresh){
            UserService.getDAC(refresh).then(function(data){
                if(data.centers)
                    $scope.dacs = data.centers;
                if(data.meta.updated)
                    $scope.dac_updated = data.meta.updated;
                $scope.$broadcast('scroll.refreshComplete');
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        function updateRefreshText(i){
            if(i==0)
                $scope.refreshText = 'Pull to get your location...';
            else if(i==1)
                $scope.refreshText = 'Pull to refresh Assistance Centers...';
            else if(i==2)
                $scope.refreshText = 'Pull to refresh your status and ETA...';
        }

        $scope.slideHasChanged = function($index){
            // console.log($index);
        }

        $scope.nextSlide = function() {
            $ionicSlideBoxDelegate.next();
            updateRefreshText($ionicSlideBoxDelegate.currentIndex());
            $ionicScrollDelegate.scrollTop();
          }

        $scope.prevSlide = function() {
           $ionicSlideBoxDelegate.previous();
           updateRefreshText($ionicSlideBoxDelegate.currentIndex());
           $ionicScrollDelegate.scrollTop();
          }
        
        $scope.doRefresh = function(){
            //update location
            if($ionicSlideBoxDelegate.currentIndex() == 0){
                $scope.address = $sce.trustAsHtml('<i class="icon ion-loading-d"></i>');
                $scope.locateUser(true);
            } else if($ionicSlideBoxDelegate.currentIndex() == 1){
                $scope.getDAC(true);
            } else if($ionicSlideBoxDelegate.currentIndex() == 2){
                // TODO look up user status
                $scope.$broadcast('scroll.refreshComplete');
            }
        };

        $scope.saveForm = function(){
            //first validate form

            UserService.saveUser($scope.user).then(function(data){
                $cordovaDialogs.alert('Thanks for submitting your info', 'Complete', 'Close').then(function() {
                  // callback success
                });
            });
        };

        $scope.selectedNeeds = function () {
            $scope.user.needs = $filter('filter')($scope.needs, {checked: true});
        }

        $scope.selectedKidsPets = function () {
            $scope.user.kids_pets = $filter('filter')($scope.kids_pets, {checked: true});
        }

        $scope.locateUser();
        $scope.getDAC();

    });