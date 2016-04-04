angular.module("contactsApp").controller('LeagueController',['$scope','$location','$routeParams','$modal','$window','$sce','Leagues','Accounts',function($scope,$location,$routeParams,$modal,$window,$sce,Leagues,Accounts){
	$scope.loaded = 0;
	$scope.loggedIn = 0;

	//if the currentLeague in the service doesnt exist or exists and is not the desired, fetch current league
	if( !Leagues.currLeague || (Leagues.currLeague.leagueName != $routeParams.leagueName) ) {
		Leagues.getLeagueByName($routeParams.leagueName,getLeagueSuccess,getLeagueFail);
	}
	else{
		$scope.league =  Leagues.currLeague;
		$scope.teams = $scope.league.teams;
		$scope.account = Accounts.currAccount;
		verifyLogin();
	}
	function getLeagueSuccess(response){
		console.log('LeagueFound: ' + response.data.leagueName);
		Leagues.currLeague = response.data;
		$scope.league =  response.data;
		$scope.teams = $scope.league.teams;

		if($scope.teams && $scope.teams.length >= 2){
			$scope.playoffOptions = [2];
			if($scope.teams.length >= 4){
				$scope.playoffOptions.push(4);
			}
			if($scope.teams.length >= 6){
				$scope.playoffOptions.push(6);
			}
			if($scope.teams.length >= 8){
				$scope.playoffOptions.push(8);
			}		
		}
		$scope.account = Accounts.currAccount;
		verifyLogin();
	}
	function getLeagueFail(response){
		console.log('No league found with that name');
		alert('No league found with that name');
	}

	//start add/manage team input
	$scope.addTeam = function() {
		//inititalize teams array for currLeague
		if(! $scope.league.teams )Leagues.currLeague.teams = [];
		var url = "/leagues/" + $routeParams.leagueName + "/newTeam"
		$location.path(url);
	}
	
	$scope.editTeam = function(index) {
		var url = "/leagues/" + $routeParams.leagueName + "/editTeam/" + index;
		$location.path(url);
	}
	//en add/manage team input

	//start settings input
	if($scope.teams && $scope.teams.length >= 2){
		$scope.playoffOptions = [2];
		if($scope.teams.length >= 4){
			$scope.playoffOptions.push(4);
		}
		if($scope.teams.length >= 6){
			$scope.playoffOptions.push(6);
		}
		if($scope.teams.length >= 8){
			$scope.playoffOptions.push(8);
		}		
	}

	$scope.playoffSelection = '-1';
	$scope.gamesPerTeamEntry = {
        text: '',
    };

	$scope.changePlayoffOption = function(index){
		$scope.playoffSelection = String($scope.playoffOptions[index]);
	}

	$scope.saveSettings = function(){
		var ans = true
		//var ans = confirm("Saving will finalize league settings and teams.\nPlayers and team details may still be edited.\nSave and continue?");
		if( ans == true){
			if( ($scope.gamesPerTeamEntry.text % 2) != 0 && $scope.gamesPerTeamEntry.text > 0){
				alert("Please enter an even value for the number of games per team.");
				return;
			}
			$scope.league.gamesPerTeam = parseInt($scope.gamesPerTeamEntry.text);
			//$scope.league.playoffTeams = $scope.playoffSelection;
			$scope.league.allMatchups = 0;
			var game = {};
			//game outcome = 0 indicates the game score hasnt beeen entered
			game.outcome = 0;
			// team1/2 = -1 indicates the teams have not been set for this game
			game.team1 = -1;
			game.team2 = -1;
			game.team1Score = -1;
			game.team2Score = -1;
			game.gameLocation = "";
			game.date = "";
			game.configured = 0;
			$scope.league.games = new Array( $scope.teams.length * $scope.league.gamesPerTeam / 2 );
			for (i=0; i < $scope.teams.length * $scope.league.gamesPerTeam / 2; i++){
				$scope.league.games[i] = angular.copy(game);
				$scope.league.games[i].gameId = i;
			}
			Leagues.editLeague($scope.league,saveSettingsSuccess,saveSettingsFail);
			
		}
	}
	function saveSettingsFail(response){
		console.log("Failed to edit league after saving league settings");
	}
	function saveSettingsSuccess(response){
		Leagues.currLeague = response.config.data;
		$scope.league =  response.config.data;
		console.log('League Settings Saved: ' + $scope.league.leagueName );

	}

	function isNormalInteger(str) {
	    var n = ~~Number(str);
	    return String(n) === str && n >= 0;
	}
	//end setting input


	//for accordions/game configuration
	$scope.status;
	$scope.oneAtATime = true; 	//acordions close when another is opened
	$scope.team1Change = function(teamIndex,gameIndex,prevSelectedIndex){
		$scope.league.games[gameIndex].team1 = teamIndex;
		if( prevSelectedIndex && prevSelectedIndex != -1){
			$scope.league.teams[prevSelectedIndex].gamesAssigned--;
		}
		$scope.league.teams[teamIndex].gamesAssigned++;
		allGamesConfigured(gameIndex);
	}
	$scope.team2Change = function(teamIndex,gameIndex,prevSelectedIndex){
		$scope.league.games[gameIndex].team2 = teamIndex;
		if( prevSelectedIndex && prevSelectedIndex != -1){
			$scope.league.teams[prevSelectedIndex].gamesAssigned--;
		}
		$scope.league.teams[teamIndex].gamesAssigned++;
		allGamesConfigured(gameIndex);
	}
	$scope.blankteam1 = function(prevSelectedIndex,gameIndex){
		$scope.league.teams[prevSelectedIndex].gamesAssigned--;
		$scope.league.games[gameIndex].team1 = -1;
		allGamesConfigured(gameIndex);
	}
	$scope.blankteam2 = function(prevSelectedIndex,gameIndex){
		$scope.league.teams[prevSelectedIndex].gamesAssigned--;
		$scope.league.games[gameIndex].team2 = -1;
		allGamesConfigured(gameIndex);
	}

	function allGamesConfigured(currGameIndex){
		var game = $scope.league.games[currGameIndex];
		//if current game has date and opponents set, mark as configured. otherwise as unconfigured
		//configured = 1; unconfigured =0
		if(game.team1 != -1 && game.team2 != -1 && game.date){
			$scope.league.games[currGameIndex].configured = 1;	
		}
		else{
			$scope.league.games[currGameIndex].configured = 0;	
		}
		for(i=0; i < $scope.league.games.length; i++ ){
			if($scope.league.games[i].configured == 0){ 
				//1 game found not configured
				$scope.league.allMatchups = 0;
				return;
			}
		}
		//all games configured
		$scope.league.allMatchups = 1;
	}

		$scope.animationsEnabled = true;

		$scope.openCalendarModal = function (gameIndex) {
		    var modalInstance = $modal.open({
		      animation: $scope.animationsEnabled,
		      templateUrl: 'views/modalCalendarContent.html',
		      controller: 'ModalCalendarController',
		      size: null,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }
		    });
		    modalInstance.result.then(function (modalDateTime) {
		      		$scope.league.games[gameIndex].date = modalDateTime;
					allGamesConfigured(gameIndex);
		    }, function () {
		      console.log('Modal dismissed at: ' + new Date());
		    });
		};
		//end modal code

	$scope.saveMatchups = function () {
		$scope.league.allMatchupsSaved = 1;
		Leagues.editLeague($scope.league,saveMatchupsSuccess,saveMatchupsFail);
	}
	function saveMatchupsFail(response){
		console.log("Failed to edit league after saving league settings");
		$scope.league.allMatchupsSaved = 0;
	}
	function saveMatchupsSuccess(response){
		Leagues.currLeague = response.config.data;
		$scope.league =  response.config.data;
		$window.scrollTo(0, 0);
		console.log('League Matchups Saved : ' + $scope.league.leagueName );

	}

	$scope.saveMatchupEntries = function () {
		Leagues.editLeague($scope.league,saveMatchupEntriesSuccess,saveMatchupEntriesFail);
	}
	function saveMatchupEntriesFail(response){
		console.log("Failed to edit league after saving league settings");
		$scope.league.allMatchupsSaved = 0;
	}
	function saveMatchupEntriesSuccess(response){
		Leagues.currLeague = response.config.data;
		$scope.league =  response.config.data;
		console.log('League Matchups Saved : ' + $scope.league.leagueName );

	}
	//end for accordians/game configuration

	//for score entry
	$scope.allScoresEntered = 0;
	$scope.advancedToFinals = 0;


	$scope.scoreChange = function(gameId){
		var game = $scope.league.games[gameId];
		if( (typeof game.team1ScoreHolder === "undefined") ||  (typeof game.team2ScoreHolder === "undefined") ){
			return
		}
		else{
			game.team1Score = game.team1ScoreHolder
			game.team2Score = game.team2ScoreHolder			
		}
		if( game.team2Score == -1 || game.team1Score == -1){
			//game score not entered for game 1 or 2
			return
		}
		//readjust wins/losses when game scor is changed
		if(game.outcome == 0){
			$scope.league.teams[game.team1].gamesPlayed++;
			$scope.league.teams[game.team2].gamesPlayed++;
		}
		if(game.outcome == 1){
			$scope.league.teams[game.team1].wins--;
			$scope.league.teams[game.team2].losses--;
		}
		if(game.outcome == 2){
			$scope.league.teams[game.team2].wins--;
			$scope.league.teams[game.team1].losses--;
		}
		if(game.outcome == 3){
			$scope.league.teams[game.team2].ties--;
			$scope.league.teams[game.team1].ties--;
		}
		if( game.team1Score > game.team2Score ){
			$scope.league.games[gameId].outcome = 1;
			$scope.league.teams[game.team1].wins++;
			$scope.league.teams[game.team2].losses++;
		}
		else if( game.team1Score < game.team2Score ){
			$scope.league.games[gameId].outcome = 2;
			$scope.league.teams[game.team2].wins++;
			$scope.league.teams[game.team1].losses++;;
		}
		else{
			$scope.league.games[gameId].outcome = 3;
			$scope.league.teams[game.team2].ties++;
			$scope.league.teams[game.team1].ties++;;
		}
		for(i=0; i < $scope.league.teams.length; i++){
			$scope.league.teams[i].pointsFor = 0;
			$scope.league.teams[i].pointsAgainst = 0;
			$scope.league.teams[i].differential = 0;
		}
		var allScores = 1
		for(i=0; i < $scope.league.games.length; i++){
			if( ($scope.league.games[i].team1Score == -1)  || ($scope.league.games[i].team2Score == -1) ){
				allScores = 0
				continue
			}
			var team1ID = $scope.league.games[i].team1;
			var team2ID = $scope.league.games[i].team2;
			$scope.league.teams[team1ID].pointsFor += $scope.league.games[i].team1Score;
			$scope.league.teams[team1ID].pointsAgainst += $scope.league.games[i].team2Score;
			$scope.league.teams[team1ID].differential += ($scope.league.games[i].team1Score - $scope.league.games[i].team2Score);
			$scope.league.teams[team2ID].pointsFor += $scope.league.games[i].team2Score;
			$scope.league.teams[team2ID].pointsAgainst += $scope.league.games[i].team1Score;
			$scope.league.teams[team2ID].differential += ($scope.league.games[i].team2Score - $scope.league.games[i].team1Score);
		}
		if(allScores == 1){
			$scope.league.allScoresEntered = 1
		}
		else{
			$scope.league.allScoresEntered = 0
		}

	}

	$scope.standingsTooltip = $sce.trustAsHtml("Standings are calculated using following tiebreaker rules:\n1: Most Wins\n2:Least Losses\n3:Most Ties\n4:Highest Point Differentail Value\n5:Most Points For\n6:Least Points Against\n7:Randomly Selected");

	$scope.saveGameScores = function(){
		Leagues.editLeague($scope.league,saveGameScoresSuccess,saveGameScoresFail);
	}
	function saveGameScoresFail(response){
		console.log("Failed to save game scores");
	}
	function saveGameScoresSuccess(response){
		Leagues.currLeague = response.config.data;
		$scope.league =  response.config.data;
		console.log('League Game Scores Saved : ' + $scope.league.leagueName );
	}

	$scope.advanceToFinals = function(){
		$scope.league.advancedToFinals = 1;
		Leagues.editLeague($scope.league,advancdToFinalsSuccess,advancdToFinalsFail);
	}
	function advancdToFinalsFail(response){
		console.log("Failed to save and advance to finals");
	}
	function advancdToFinalsSuccess(response){
		Leagues.currLeague = response.config.data;
		$scope.league =  response.config.data;
		console.log('League advanced to finals: ' + $scope.league.leagueName );
	}
	//end score entry
	
	//for championship management
	$scope.openCalendarModalChamp = function () {
	    var modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
	      templateUrl: 'views/modalCalendarContent.html',
	      controller: 'ModalCalendarController',
	      size: null,
	      resolve: {
	        items: function () {
	          return $scope.items;
	        }
	      }
	    });
	    modalInstance.result.then(function (modalDateTime) {
	      		$scope.league.championship.date = modalDateTime;
	    }, function () {
	      console.log('Modal dismissed at: ' + new Date());
	    });
	};

	$scope.championshipScores = function () {
		if( !$scope.league.championship.team1Score || !$scope.league.championship.team2Score ){
			$scope.league.championship.winner = -2
			return
		}
		if($scope.league.championship.team1Score > $scope.league.championship.team2Score){
			$scope.league.championship.winner = $scope.league.championship.team1
		}
		else if($scope.league.championship.team1Score < $scope.league.championship.team2Score){
			$scope.league.championship.winner = $scope.league.championship.team2
		}
		else{
			$scope.league.championship.winner = -1
		}
	}
	//end championship management


	$scope.viewTeam = function(teamName){
		Leagues.editLeague($scope.league,saveGameScoresSuccess,saveMatchupsFail);
		y = 0
		while(1){
			if($scope.league.teams[y].teamName == teamName) break;
			y++;
		}
		var url = "/leagues/" + $routeParams.leagueName + "/viewTeam/" + y + "/1"; 
		$location.path(url);
	}

	$scope.viewTeamFromViewPage = function(teamName){
		y = 0
		while(1){
			if($scope.league.teams[y].teamName == teamName) break;
			y++;
		}
		var url = "/leagues/" + $routeParams.leagueName + "/viewTeam/" + y + "/0";
		$location.path(url);
	}


	//for account info  and logout

	function verifyLogin(){
		Accounts.verifyLogin(loggedIn,notLoggedIn)
	}
	function loggedIn(response){
		$scope.loggedIn = 1;
		$scope.account = response.data
		$scope.loaded=1;

	}
	function notLoggedIn(response){
		$scope.loggedIn = 0;
		$scope.loaded=1;

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


}]);
