var app = angular.module('controller.accounts', ['ionic']);

app.controller('AccountsCtrl', function($rootScope, $scope, $window, $http, RequestService, AccountsService, LoadingService, AlertService) {

  var isLoggedIn = AccountsService.isLoggedIn();

  $scope.accounts = {
    os: false,
    pro: false,
  };

  var fetchAccounts = function(pro) {

    LoadingService.show();

    RequestService
        .request('GET', '/accounts?all=true', pro, false)
        .then(function(data) {
          // Success
          console.log('Success-Accounts! (Pro: ' + pro + ')');

          if (!pro) {
            $scope.accounts.os = data.accounts;
          } else {
            $scope.accounts.pro = data.accounts;
          }

          AccountsService.setAccounts(data.accounts, pro);

          if (!isLoggedIn.pro) {
            LoadingService.hide();
          } else if (isLoggedIn.pro && pro) {
            LoadingService.hide();
          }
        }, function(data) {
          // Failure
          AlertService.raiseAlert('Oops! We couldn\'t get your accounts from Travis CI. Please try again.');
          LoadingService.hide();
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
  };

  $scope.fetchData = function() {
    if (isLoggedIn.os) {
      fetchAccounts(false);
    }

    if (isLoggedIn.pro) {
      fetchAccounts(true);
    }

    if (!isLoggedIn.os && !isLoggedIn.pro) {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    }
  };

  $scope.fetchData();

  $scope.shouldDisable = function(subscribed, education) {
    if (subscribed || education) {
      return false;
    }
    return true;
  };

  // Start Login
  var options = {
    client_id: 'a6adc03baaa25c30292c',
    client_secret: '49c6d6012de3988db2364b49e161f8fe3052e920',
    scope: [
      'user:email', 'read:org', 'repo_deployment',
      'repo:status', 'write:repo_hook'
    ]
  };

  $scope.login = function(pro) {

    LoadingService.show();

    if (pro) {
      options.scope.push('repo');
    }

    //Build the OAuth consent page URL
    var githubUrl = 'https://github.com/login/oauth/authorize?';
    var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scope;
    var authWindow = $window.open(authUrl, '_blank', 'location=no,toolbar=yes,toolbarposition=top,closebuttoncaption=Close,clearcache=yes');

    authWindow.addEventListener('loadstart', function(e) {
      var raw_code = /code=([^&]*)/.exec(e.url) || null;
      var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
      var error = /\?error=(.+)$/.exec(e.url);

      if (code || error) {
        // Close the browser if code found or error
        authWindow.close();
      }

      // If there is a code, proceed to get token from github
      if (code) {
        requestToken(code, pro);
      } else if (error) {
        AlertService.raiseAlert('Oops! Something went wrong and we couldn\'t log you in using Github. Please try again.');
        LoadingService.hide();
      }
    });

    // If 'Done' button is pressed, hide 'Loading'
    authWindow.addEventListener('exit', function(e) {
      console.log('Github InAppBrowser Window Closed');
      LoadingService.hide();
    }, false);

  };

  function requestToken(code, pro) {
    $http.post('https://github.com/login/oauth/access_token', {
      client_id: options.client_id,
      client_secret: options.client_secret,
      code: code,
    }).
      success(function(data, status, headers, config) {
        // If access token received, authenticate with Travis
        var githubtoken = data.split('&')[0].split('=')[1];
        console.log('Github Token: ' + githubtoken);
        authTravis(githubtoken, pro);
      }).
      error(function(data, status, headers, config) {
        console.log(data);
        AlertService.raiseAlert('Oops! Something went wrong and we couldn\'t log you in. Please try again.');
        LoadingService.hide();
      });
  }

  function authTravis(githubtoken, pro) {
    RequestService
        .request('POST', '/auth/github', pro, {github_token: githubtoken})
        .then(function(data) {
          // Success
          console.log('Success!');

          if (pro == 'false' || pro === false) {
            AccountsService.tokens.os = data.access_token;
            $window.localStorage.travisostoken = data.access_token;
          } else if (pro == 'true' || pro === true) {
            AccountsService.tokens.pro = data.access_token;
            $window.localStorage.travisprotoken = data.access_token;
          }

          LoadingService.hide();

          // Analytics Tracking
          if (typeof analytics !== 'undefined') {
            analytics.trackEvent('Accounts', 'Logged In', '');
          }

          fetchAccounts(pro);
        }, function(data) {
          console.log(data);
          AlertService.raiseAlert('Oops! Something went wrong and we couldn\'t log you in. Please try again.');
          LoadingService.hide();
        });
  }

  $scope.logOut = function() {
    $scope.accounts.os = false;
    $scope.accounts.pro =  false;
    AccountsService.logOut();
  };

});
