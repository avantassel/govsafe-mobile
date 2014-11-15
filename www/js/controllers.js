angular.module('govsafe.controllers', [])

    .controller('AppCtrl', function ($scope, $state, OpenFB) {

        $scope.logout = function () {
            OpenFB.logout();
            $state.go('app.login');
        };

        $scope.revokePermissions = function () {
            OpenFB.revokePermissions().then(
                function () {
                    $state.go('app.login');
                },
                function () {
                    alert('Revoke permissions failed');
                });
        };

    })
    
    .controller('LoginCtrl', function ($scope, $state, $location, $http, API_VARS) {

        $scope.civicIdLogin = function () {

            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            $http.defaults.headers.post['x-accela-appid'] = API_VARS.client_id;

            $scope.login = function() {
                var ref = window.open('https://auth.accela.com/oauth2/authorize?response_type=code&environment=TEST&redirect_uri=http%3A%2F%2Flocalhost%3A8100&client_id=' + API_VARS.client_id, '_blank');
                ref.addEventListener('loadstart', function(event) { 
                    if((event.url).startsWith("http://localhost:8100")) {
                        requestToken = (event.url).split("code=")[1];
                        $http({method: "post", url: "https://apis.accela.com/oauth2/token", data: "client_id=" + API_VARS.client_id + "&client_secret=" + API_VARS.client_secret + "&redirect_uri=http%3A%2F%2Flocalhost%3A8100" + "&grant_type=authorization_code" + "&code=" + requestToken })
                            .success(function(data) {
                                //set token to LS
                                window.localStorage.setItem('token', data.access_token);

                                accessToken = data.access_token;
                                //$location.path("/person");
                                $http.defaults.headers.post['Content-Type'] = 'application/json';
                                $http.defaults.headers.post['Accept'] = 'application/json';
                                $http.defaults.headers.post['Authorization'] = accessToken;
                                $http({method: "get", url: "https://apis.accela.com/v3/system/common/modules"})
                                    .success(function(data) {
                                        debugger;
                                        $state.go('app.feed');

                                    })
                                    .error(function(data, status) {
                                        alert("ERROR: " + data);
                                    });
                            })
                            .error(function(data, status) {
                                
                                var output = '';
                                for (var property in data) {
                                  output += property + ': ' + data[property]+'; ';
                                }
                                console.log(output);
                                
                                alert("ERROR: " + data);

                            });
                        ref.close();
                    }
                });
            }
         
            if (typeof String.prototype.startsWith != 'function') {
                String.prototype.startsWith = function (str){
                    return this.indexOf(str) == 0;
                };
            }

            // OpenFB.login('email,read_stream,publish_stream').then(
            //     function () {
            //         $location.path('/app/person/me/feed');
            //     },
            //     function () {
            //         alert('OpenFB login failed');
            //     });

            $scope.login();
        };

    })

    .controller('ProfileCtrl', function ($scope, OpenFB) {
        OpenFB.get('/me').success(function (user) {
            $scope.user = user;
        });
    })

    .controller('AssistanceCtrl', function ($scope, $filter, $sce, $stateParams, $cordovaDialogs, $ionicLoading, $ionicSlideBoxDelegate, UserService) {
        
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
        $scope.user = {};

        UserService.getUser().then(function(data){
            $scope.user = data;            
        });

        var typeform = angular.element( document.querySelector( '#start-form' ) )

        //TODO, wire this up or something
        UserService.getUser({}).then(function(data){
            console.log(data);
        });

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
          }

        $scope.prevSlide = function() {
            $ionicSlideBoxDelegate.previous();
            updateRefreshText($ionicSlideBoxDelegate.currentIndex());
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