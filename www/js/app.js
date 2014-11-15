angular.module('govsafe', ['ionic', 'ngCordova', 'openfb', 'govsafe.services','govsafe.controllers'])
    .constant('API_VARS',{host:'https://apis.accela.com/v3',client_id:'635490299385961322',client_secret:'5ab5b9c806984bfb8f69f83cc7abf324'})
    .filter('escape', function() {
        return window.escape;
    })
    .run(function ($rootScope, $state, $ionicPlatform, $window, OpenFB) {

        //OpenFB.init('594364694019603','http://localhost:8100/oauthcallback.html', $window.sessionStorage);

        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        // $rootScope.$on('$stateChangeStart', function(event, toState) {
        //     if (toState.name !== "app.login" && toState.name !== "app.logout" && !$window.sessionStorage['fbtoken']) {
        //         $state.go('app.login');
        //         event.preventDefault();
        //     }
        // });

        $rootScope.$on('OAuthException', function() {
            $state.go('app.login');
        });

    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: "AppCtrl"
            })

            .state('app.login', {
                url: "/login",
                views: {
                    'menuContent': {
                        templateUrl: "templates/login.html",
                        controller: "LoginCtrl"
                    }
                }
            })

            .state('app.logout', {
                url: "/logout",
                views: {
                    'menuContent': {
                        templateUrl: "templates/logout.html",
                        controller: "LogoutCtrl"
                    }
                }
            })

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            })

            .state('app.assistance', {
                url: "/assistance",
                views: {
                    'menuContent': {
                        templateUrl: "templates/assistance.html",
                        controller: "AssistanceCtrl"
                    }
                }
            });

        // fallback route
        $urlRouterProvider.otherwise('/app/assistance');

    });

