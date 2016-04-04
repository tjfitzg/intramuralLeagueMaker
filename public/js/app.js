angular.module("contactsApp", ['ngRoute','ui.bootstrap','ngAnimate'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                controller: "HomeController",
                templateUrl: "views/home.html"
            })
            .when("/leagues/:leagueName", {
                controller: "LeagueController",
                templateUrl: "views/league.html"
            })
            .when("/viewleague/:leagueName", {
                controller: "LeagueController",
                templateUrl: "views/viewLeague.html"
            })
            .when("/leagues/:leagueName/newTeam", {
                controller: "NewTeamController",
                templateUrl: "views/newTeam.html"
            })
            .when("/leagues/:leagueName/editTeam/:teamIndex", {
                controller: "EditTeamController",
                templateUrl: "views/newTeam.html"
            })
            .when("/leagues/:leagueName/viewTeam/:teamIndex/:loggedInStatus", {
                controller: "EditTeamController",
                templateUrl: "views/viewTeam.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })

