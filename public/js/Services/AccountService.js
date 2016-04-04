angular.module("contactsApp")
    .service("Accounts", function($http) {
        this.register =  function(email,password,registerSuccess,registerFail) {
            user = {
                        "email": email,
                        "password": password
                    }
            var url = "/register";
            return $http.post(url, user).
                then(function(response) {
                    console.log("Success registering.");
                    return registerSuccess(response);
                }, function(response) {
                    console.log("Error registering.");
                    return registerFail(response);
                });
        }

        this.login =  function(email,password,loginSuccess,loginFail) {
            user = {
                        "username": email,
                        "password": password
                    }
            var url = "/login";
            return $http.post(url, user).
                then(function(response) {
                    console.log("success logging in.");
                    return loginSuccess(response);
                }, function(response) {
                    console.log("Error logging in.");
                    return loginFail(response);
                });
        }

        this.logout =  function(loginSuccess,loginFail) {
            var url = "/logout";
            return $http.post(url).
                then(function(response) {
                    console.log("success logged out.");
                    return logoutSuccess(response);
                }, function(response) {
                    console.log("Error logging out.");
                    return logoutFail(response);
                });
        }

        this.verifyLogin = function(loggedIn,notLoggedIn) {
            var url = "/verifyLogin"
            return $http.get(url).
                then(function(response) {
                    return loggedIn(response);
                }, function(response) {
                    return notLoggedIn(response);
                });
        };

        this.getCustomData = function(customDataFound,customDataNotFound) {
            var url = "/getCustomData"
            return $http.get(url).
                then(function(response) {
                    return customDataFound(response);
                }, function(response) {
                    return customDataNotFound(response);
                });
        };
        
        this.saveUser = function(user,saveUserSuccess,saveUserFail) {
            var url = "/saveUser"
            return $http.post(url,user).
                then(function(response) {
                    return saveUserSuccess(response);
                }, function(response) {
                    return saveUserFail(response);
                });
        };

   
    })
