angular.module('sociogram.services', [])
.factory('UserService', function(API_VARS,$http,$q,$rootScope) {

	return {
	// getUser response
	// 		{
	//     "id": "sample string 1",
	//     "loginName": "sample string 2",
	//     "email": "sample string 3",
	//     "firstName": "sample string 4",
	//     "lastName": "sample string 5",
	//     "countryCode": "sample string 6",
	//     "streetAddress": "sample string 7",
	//     "city": "sample string 8",
	//     "state": "sample string 9",
	//     "postalCode": "sample string 10",
	//     "phoneCountryCode": "sample string 11",
	//     "phoneAreaCode": "sample string 12",
	//     "phoneNumber": "sample string 13",
	//     "avatarUrl": "sample string 14"
	// }
		getUser: function (args){
	      args.client_id = API_VARS.client_id;
	      args.client_secret = API_VARS.client_secret;
	      // args.token = '';
	      args.lang='en';

	      var q = $q.defer();
	     
	     	//get token from LS
	     	var token = window.localStorage.getItem('token');
	     	$http.defaults.headers.get['Authorization'] = token;

	        $http.get(API_VARS.host+'/users/me',{params: args}).then(function(response){

	          q.resolve( response.data );

	        }, function(response){
	          //throw error
	          q.reject( );
	        });
	      
	      return q.promise;
	    },

	    saveUser: function (args){
	      
	      args.token = window.localStorage.getItem('token');

	      var q = $q.defer();
	     
	     	$http.post('http://www.govsafe.org/saveuser.php', args ).then(function(response){

	        	q.resolve( response.data );
	          
	        }, function(response){
	          //throw error
	          q.reject( );
	        });
	      
	      return q.promise;
	    };
	}
};
