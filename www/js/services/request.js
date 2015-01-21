var services = angular.module('services.request', ['ionic']);

services.factory('RequestService', function (AccountsService, $q, $window, $http) {

    var service = {

        token: false,

        request: function (method, url, data) {

            // Get token wheather Pro or not
            var domain, host;

            if (AccountsService.isPro === true) {
                domain = "https://api.travis-ci.com";
                host = "api.travis-ci.com";
            } else if (AccountsService.isPro === false) {
                domain = "https://api.travis-ci.org";
                host = "api.travis-ci.org";
            } else {
                alert("ERROR. No domain.");
            }

            var deferred = $q.defer();

            var headers = {
                'Accept': 'application/vnd.travis-ci.2+json',
                // 'User-Agent': 'MyClient/1.0.0',
                // 'Host': host,
                // 'Content-Type': 'application/json',
                // 'Content-Length': 37
            };

            if (url != "/auth/github") {
                headers['Authorization'] = "token " + service.token;
            }

            $http({
                url: domain + url,
                method: method,
                headers: headers,
                data : data })
                .success(function (data) {
                    // Success
                    deferred.resolve(data);
                }).error(function (data){
                    // Failure
                    deferred.reject(data);
                });

            return deferred.promise;

        }

    };

    return service;

});