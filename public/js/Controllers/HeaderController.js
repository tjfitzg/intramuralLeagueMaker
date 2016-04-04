angular.module("contactsApp").controller('HeaderController',['$scope','$location',function($scope,$location){

	$scope.clickTitle = function(){
		$location.path("/");
	}

}]);
