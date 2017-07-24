angular.module('app', ['ionic', 'app.last']).run(function($ionicPlatform) {
  return $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      return StatusBar.styleDefault();
    }
  });
}).factory('utils', function() {
  var utils;
  return utils = {
    daysBefore: function(d, n) {
      return new Date(d.getTime() - n * 24 * 60 * 60 * 1000);
    },
    fmtYMD: function(d) {
      return d.toISOString().slice(0, 10).replace(/-/g, "");
    },
    prevValidDate: function(d) {
      switch (d.getDay()) {
        case 0:
          return daysBefore(d, 2);
        case 1:
          return daysBefore(d, 3);
        default:
          return daysBefore(d, 1);
      }
    },
    weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    mseUrl: function(d) {
      return "http://www.mse.mk/Repository/Reports/MK/ReportMK_1_" + ((utils.fmtYMD(d)) + "_" + (utils.fmtYMD(d)) + ".xls");
    }
  };
}).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('root', {
    url: '/',
    templateUrl: 'views/home.html'
  }).state('home', {
    url: '/home',
    templateUrl: 'views/home.html'
  }).state('last', {
    url: '/last',
    templateUrl: 'views/last.html',
    controller: 'Last'
  });
  return $urlRouterProvider.otherwise('/home');
}).controller('Main', function($scope, utils) {
  $scope.weekDays = utils.weekDays;
  return $scope.hour = (new Date()).getHours();
});

angular.module('app.last', []).controller('Last', function($scope, $http, utils) {
  var date, loadLast;
  date = new Date();
  date = date.getHours < 14 ? utils.prevValidDate(date) : date;
  loadLast = function(d) {
    return $http.get(utils.mseUrl(d), {
      responseType: "arraybuffer"
    }).then(function(res) {
      var arr, bstr, buf, data, i, rcnt, workbook, ws;
      console.log("Successful load " + d);
      console.log(res);
      $scope.date = d.toISOString();
      buf = res.data;
      data = new Uint8Array(buf);
      arr = [];
      for (i in data) {
        d = data[i];
        arr[i] = String.fromCharCode(d);
      }
      bstr = arr.join('');
      workbook = XLSX.read(bstr, {
        type: "binary"
      });
      ws = workbook.Sheets.Sheet1;
      rcnt = ws['!rows'].length;
      return console.log("Total rows: " + rcnt);
    }, function(res) {
      if (res.status === '404') {
        return loadLast(prevValidDate(d));
      } else {
        return console.log("Received status: " + res.status);
      }
    });
  };
  return loadLast(date);
});
