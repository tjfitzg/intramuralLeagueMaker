angular.module("contactsApp").controller('EditTeamController',['$scope','$location','$routeParams','Leagues','Accounts',function($scope,$location,$routeParams,Leagues,Accounts){
	//on Load Up
	if( !Leagues.currLeague || (Leagues.currLeague.leagueName != $routeParams.leagueName) ) {
		Leagues.getLeagueByName($routeParams.leagueName,getLeagueByNameSuccess,getLeagueByNameFail);
	}
	else{
		$scope.league =  Leagues.currLeague;
		$scope.teams = $scope.league.teams;
		$scope.newTeam = $scope.teams[$routeParams.teamIndex];
	}
	function getLeagueByNameSuccess(response){
		console.log('LeagueFound: ' + response.data.leagueName);
		Leagues.currLeague = response.data;
		$scope.league =  Leagues.currLeague;
		$scope.teams = $scope.league.teams;	
		$scope.newTeam = $scope.teams[$routeParams.teamIndex];
	}
	function getLeagueByNameFail(response){
		console.log('No league found with that name');
		alert('No league found with that name');
	}

	$scope.editing = true;



	$scope.addPlayer= function() {
		var addNewPlayer = {};
		//validate newPlayer exists
		if( ! $scope.newPlayer){
			alert('No Player Info Entered');
			return;
		}
		//validate player name and add to newPlayer
		if( ! $scope.newPlayer.playerName ){
			alert('No Player Name');
			return;
		}
		addNewPlayer.playerName = $scope.newPlayer.playerName;
		//validate player number and add to newPlayer
		if( ! $scope.newPlayer.playerNumber ){
			alert('Enter play number from 0-99');
			return;
		}
		addNewPlayer.playerNumber = $scope.newPlayer.playerNumber;
		//add position to newPlayer
		addNewPlayer.playerPosition = $scope.newPlayer.playerPosition;
		//add newPlayer to players array of newTeam
		$scope.newTeam.players[$scope.newTeam.players.length] = addNewPlayer;
		$scope.newPlayer = null;
	}

	$scope.selected = {value: 0};
	$scope.deletePlayer= function() {
		$scope.newTeam.players.splice($scope.selected.value,1);
	}
	
	$scope.saveTeam = function() {
		if( !$scope.newTeam.teamName){
			alert('No Team Name Entered');
			return;
		}
		if( !$scope.newTeam.players || $scope.newTeam.players.length == 0){
			alert('No Players On the Team');
			return;
		}
		if( $scope.newPlayer ){
			var ans = confirm("Player Details Entered, but Not Saved. Continue Anyway?");
			if( ans != true){
				return;
			}
		}
		$scope.league.teams[$routeParams.teamIndex] = $scope.newTeam;
		Leagues.editLeague($scope.league,saveLeagueSuccess,saveLeagueFail);
	}
	function saveLeagueSuccess(response){
		console.log('LeagueEdited: ' + response.data.leagueName);
		Leagues.currLeague = response.config.data;
		var leagueUrl = "/leagues/" + Leagues.currLeague.leagueName;
	    $location.path(leagueUrl);
	}

	function saveLeagueFail(response){
		console.log('League saved unsuccessfully');
		alert('League saved unsuccessfully, try again soon');
	}

	$scope.deleteTeam = function() {
		$scope.league.teams.splice($routeParams.teamIndex,1);
		if( $scope.league.teams.length == 0) $scope.league.teams = null;
		Leagues.editLeague($scope.league,deleteTeamSuccess,deleteTeamFail);
	}
	function deleteTeamSuccess(response){
		console.log('Team deleted in league: ' + response.data.leagueName);
		Leagues.currLeague = response.config.data;
		var leagueUrl = "/leagues/" + Leagues.currLeague.leagueName;
	    $location.path(leagueUrl);
	}
	function deleteTeamFail(response){
		console.log('Team deleted unsuccessfully');
		alert('Team deleted unsuccessfully, try again.');
	}
	
// for account info and logout

	$scope.verifyLogin = verifyLogin();
	function verifyLogin(){
		Accounts.verifyLogin(loggedIn,notLoggedIn)
	}
	function loggedIn(response){
		$scope.loggedIn = 1;
		$scope.account = response.data
	}
	function notLoggedIn(response){
		$scope.loggedIn = 0;
		$scope.loaded = 1;
	}


	$scope.logout = function(){
		Accounts.logout(logoutSuccess,logoutFail);
	}
	logoutSuccess = function(response){
		var url = "/"
		$location.path(url);
	}
	logoutFail = function(response){
		console.log(response);
		var url = "/"
		$location.path(url);
	}

	//for view team partial html page
	$scope.back = function(){
		if( $routeParams.loggedInStatus == 1){
			var leagueUrl = "/leagues/" + Leagues.currLeague.leagueName;
		    $location.path(leagueUrl);
		}
		else{
			var leagueUrl = "/viewleague/" + Leagues.currLeague.leagueName;
		    $location.path(leagueUrl);
		}
    }
    
}]);
