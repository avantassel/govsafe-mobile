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

    .controller('ShareCtrl', function ($scope, OpenFB) {

        $scope.item = {};

        $scope.share = function () {
            OpenFB.post('/me/feed', $scope.item)
                .success(function () {
                    $scope.status = "This item has been shared on OpenFB";
                })
                .error(function(data) {
                    alert(data.error.message);
                });
        };

    })

    .controller('ProfileCtrl', function ($scope, OpenFB) {
        OpenFB.get('/me').success(function (user) {
            $scope.user = user;
        });
    })

    .controller('PersonCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId).success(function (user) {
            $scope.user = user;
        });
    })

    .controller('FriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/friends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('MutualFriendsCtrl', function ($scope, $stateParams, OpenFB) {
        OpenFB.get('/' + $stateParams.personId + '/mutualfriends', {limit: 50})
            .success(function (result) {
                $scope.friends = result.data;
            })
            .error(function(data) {
                alert(data.error.message);
            });
    })

    .controller('FeedCtrl', function ($scope, $stateParams, $ionicLoading, $ionicSlideBoxDelegate, UserService) {
        
        $scope.step = 1;
        $scope.dac_chosen = '';

        UserService.getUser({}).then(function(data){
            console.log(data);
        });

        $scope.nextSlide = function() {
            $ionicSlideBoxDelegate.next();
          }

        $scope.prevSlide = function() {
            $ionicSlideBoxDelegate.previous();
          }
        // $scope.show = function() {
        //     $scope.loading = $ionicLoading.show({
        //         content: 'Loading feed...'
        //     });
        // };
        // $scope.hide = function(){
        //     $scope.loading.hide();
        // };

        // function loadFeed() {
        //     $scope.show();
        //     OpenFB.get('/' + $stateParams.personId + '/home', {limit: 30})
        //         .success(function (result) {
        //             $scope.hide();
        //             $scope.items = result.data;
        //             // Used with pull-to-refresh
        //             $scope.$broadcast('scroll.refreshComplete');
        //         })
        //         .error(function(data) {
        //             $scope.hide();
        //             alert(data.error.message);
        //         });
        // }

        // $scope.doRefresh = loadFeed;

        // loadFeed();

    });