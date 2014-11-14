angular.module('govsafe.services', [])
.service('UserService', function(API_VARS,$http,$q,$rootScope,$cordovaGeolocation) {

	var userLocation = null, userAddress = null;


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
	     	// $http.defaults.headers.get['Authorization'] = token;

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
	    },

	    locateUser: function(){

	        var q = $q.defer();
	        //check local storage
		    var s_userLocation = window.localStorage.getItem('location');
		    var s_userAddress = window.localStorage.getItem('address');

		    //if we have the location in storage use that
	        if(s_userLocation){
	          q.resolve( {'loc':JSON.parse(s_userLocation), 'address': s_userAddress} );
	        } else if(userLocation==null){
	          $cordovaGeolocation
	            .getCurrentPosition()
	            .then(function(position) {
	              //save to local storage
	              window.localStorage.setItem('location', JSON.stringify(position.coords));
	              s_userLocation = position.coords ;
	              //get address
	              $http.get('http://maps.googleapis.com/maps/api/geocode/json?sensor=false&latlng='+s_userLocation.latitude+','+s_userLocation.longitude ).then(function(response){
      				if(response.data.results && response.data.results.length > 0 && response.data.results[0].formatted_address){
      					//save to local storage
      					window.localStorage.setItem('address', response.data.results[0].formatted_address);
      					s_userAddress=response.data.results[0].formatted_address;
      				}
	              	q.resolve( {'loc':s_userLocation,'address':s_userAddress} );
	              }, function(){
	              	q.resolve( {'loc':s_userLocation,'address':s_userAddress} );
	              });
	          }, function(err) {
	            q.resolve( {'loc':s_userLocation,'address':s_userAddress} );
	          });

	        } else {
	          q.resolve( {'loc':s_userLocation,'address':s_userAddress} );
	        }
	        return q.promise;
      }
	};
});
