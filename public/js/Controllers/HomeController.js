angular.module("contactsApp").controller('HomeController',['$scope','$location','Leagues','Accounts',function($scope,$location,Leagues,Accounts){
	$scope.loaded = 0;
	$scope.loggedIn = 0;
	$scope.loginFail = 0;
	$scope.registerFail = 0;
	$scope.noLeagueFound = 0;


	$scope.league = {
		"leagueName" : ""
	}

	$scope.league2 = {
		"leagueName" : ""
	}

	$scope.userDetails = {
		"email:" : "",
		"password" : "",
		"password2" : ""
	}

	$scope.goToLeague = function(leagueName) {
		var leagueUrl = "/leagues/" + leagueName;
    	$location.path(leagueUrl);		
	}

	$scope.verifyLogin = verifyLogin();
	function verifyLogin(){
		Accounts.verifyLogin(loggedIn,notLoggedIn)
	}
	function loggedIn(response){
		$scope.loggedIn = 1;
		$scope.account = response.data
		Accounts.getCustomData(customDataFound,customDataNotFound)
	}
	function notLoggedIn(response){
		$scope.loggedIn = 0;
		$scope.loaded = 1;
	}
		function customDataFound(response){
			console.log("Account CustomData Found");
			$scope.account.customData.leagues = response.data.leagues
			$scope.loaded = 1;
		}
		function customDataNotFound(response){
			console.log("Account CustomData not found");
			$scope.loaded = 1;
		}
	
	$scope.getLeague = function(league) {
		if( !league.leagueName ){
			alert("Please enter a league name.")
			return
		}
	    Leagues.getLeague(league,getLeagueSuccess,getLeagueFail);
	}
	function getLeagueSuccess(response){
		if( response.status == 202){
			$scope.noLeagueFound = 1;
			$scope.noLeagueFoundMsg = "No league with that name exists. Try Again. It is case-sensitive";
			console.log('No league found with that name');
			return
		}
		$scope.noLeagueFound = 0;
		console.log('LeagueFound: ' + response.data.leagueName);
		Leagues.currLeague = response.data;
		var leagueUrl = "/viewleague/" + response.data.leagueName;
	    $location.path(leagueUrl);
	}
	function getLeagueFail(response){
		$scope.noLeagueFound = 1;
		$scope.noLeagueFoundMsg = "No league with that name exists. Try Again. Search is case-sensitive";
		alert('Error querying league database');
	}



	$scope.createLeague = function(league){
		if( !league.leagueName ){
			alert("Please enter a league name");
			return
		}
	   	Leagues.getLeague(league,leagueQuerySuccess,leagueQueryFail);
	   	$scope.leagueName = league.leagueName
	}
	function leagueQuerySuccess(response){
		if( response.status == 202){
			Leagues.createLeague($scope.league,createLeagueSuccess,createLeagueFail);
		}
		else if( response.status == 200){
			alert("League Name already taken")
		}
	}
	function leagueQueryFail(response){
		alert("Error querying the league database")
	}
		function createLeagueSuccess(response){
			console.log('League created: ' + response.data.leagueName );
			Leagues.currLeague = response.data;
			var league = {
				leagueName: response.data.leagueName
			}
			if(!$scope.account){
				console.log('$scope.account not set in createLeagueSuccess')
				return;
			}
			if(!$scope.account.customData.leagues){
				$scope.account.customData.leagues = [league];
			}
			else{
				$scope.account.customData.leagues.push(league);
			}
			Accounts.saveUser($scope.account,saveUserSuccess,saveUserFail);
		}
		function createLeagueFail(response){
			console.log('createLeague Error: ' + response);
		}
			function saveUserSuccess(response){
				console.log("save user data (leagues) success");
				var leagueUrl = "/leagues/" + response.data.customData.leagues[response.data.customData.leagues.length - 1].leagueName;
		    	$location.path(leagueUrl);
			}
			function saveUserFail(response){
				console.log("save user data (leagues) failure");
				alert("created league but failed to save to your account")
			}
		

////////// Accounts related 
	$scope.register = function(){
		if($scope.userDetails.password != $scope.userDetails.password2){
			$scope.registerFail = 1;
			$scope.registerFailMsg = "Passwords do not Match"
			$scope.loginFail = 0;
			return
		}
		Accounts.register($scope.userDetails.email,$scope.userDetails.password,registerSuccess,registerFail);
	}
	registerSuccess = function(response){
		$scope.loginFail = 0;
		$scope.registerFail = 0;
		console.log(response);
		verifyLogin();
	}
	registerFail = function(response){
		console.log(response);
		$scope.registerFail = 1;
		$scope.registerFailMsg = response.data.message
		$scope.loginFail = 0;


	}


	$scope.login = function(){
		Accounts.login($scope.userDetails.email,$scope.userDetails.password,loginSuccess,loginFail);
	}
	loginSuccess = function(response){
		$scope.loginFail = 0;
		$scope.registerFail = 0;
		console.log(response);
		verifyLogin();
	}
	loginFail = function(response){
		console.log(response);
		$scope.loginFail = 1;
		$scope.loginFailMsg = response.data.message
		$scope.registerFail = 0;

	}

	$scope.logout = function(){
		Accounts.logout(logoutSuccess,logoutFail);
	}
	logoutSuccess = function(response){
		console.log(response);
		verifyLogin();
	}
	logoutFail = function(response){
		console.log(response);
	}

}]);
