angular.module("contactsApp")
    .service("Leagues", function($http) {

		this.createLeague = function(league,createLeagueSuccess,createLeagueFail) {
            league.leagueName = league.leagueName.trim()
		    return $http.post("/leagues", league).
		        then(function(response) {
		            return createLeagueSuccess(response);
		        }, function(response) {
		            alert("Error creating league.");
		            return createLeagueFail(response);
		        });
		};
		this.getLeague = function(league,getLeagueSuccess,getLeagueFail) {
            var url = "/leagues/" + league.leagueName.trim();
            return $http.get(url).
                then(function(response) {
                    return getLeagueSuccess(response);
                }, function(response) {
                    return getLeagueFail(response);
                });
        };
       	this.getLeagueByName = function(leagueName,getLeagueSuccess,getLeagueFail) {
            var url = "/leagues/" + leagueName.trim();
            return $http.get(url).
                then(function(response) {
                    return getLeagueSuccess(response);
                }, function(response) {
                    return getLeagueFail(response);
                });
        };

        this.editLeague = function(league,editLeagueSuccess,editLeagueFail) {
            var url = "/leagues/" + league.leagueName;
            console.log(league.leagueName);
            return $http.put(url, league).
                then(function(response) {
                    return editLeagueSuccess(response);
                }, function(response) {
                    console.log(response);
                    if(response.status == 407){
                        alert("League attempted to edit is not owned by you. Changes wiere not saved")
                    }
                    alert("Error editing this league.");
                    return editLeagueFail(response);
                });
        }

		this.currLeague = {};

	})