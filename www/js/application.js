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
  loadLast = function(date) {
    return $http.get(utils.mseUrl(date), {
      responseType: "arraybuffer"
    }).then(function(res) {
      var Ar, Br, Hr, Ir, arr, bstr, buf, d, data, h, i, j, k, len, name, r, rcount, ref, ref1, total, trns, workbook, ws;
      console.log("Successful load " + d);
      console.log(res);
      console.log(utils.mseUrl(date));
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
      rcount = ws['!rows'].length;
      console.log("Total rows: " + rcount);
      h = {};
      for (r = j = 8, ref = rcount; 8 <= ref ? j <= ref : j >= ref; r = 8 <= ref ? ++j : --j) {
        Ir = "I" + r;
        Ar = "A" + r;
        Br = "B" + r;
        Hr = "H" + r;
        if (ws[Ir] == null) {
          continue;
        }
        if (ws[Ir].v <= 0) {
          continue;
        }
        if (h[ws[Ar].v] == null) {
          h[ws[Ar].v] = {
            price: ws[Br] != null ? ws[Br].v : ws[Hr].v,
            shares: ws[Ir].v,
            count: 1
          };
        } else {
          h[ws[Ar].v].count++;
          h[ws[Ar].v].price += ws[Br] != null ? ws[Br].v : ws[Hr].v;
          h[ws[Ar].v].shares += ws[Ir].v;
        }
      }
      trns = [];
      total = 0;
      ref1 = Object.keys(h).sort();
      for (k = 0, len = ref1.length; k < len; k++) {
        name = ref1[k];
        trns.push({
          name: name,
          price: h[name].price / h[name].count,
          shares: h[name].shares
        });
        total += h[name].price / h[name].count * h[name].shares;
      }
      $scope.date = date;
      $scope.trns = trns;
      $scope.total = total;
      return console.log(trns);
    }, function(res) {
      if (res.status === 404) {
        return loadLast(prevValidDate(d));
      } else {
        return console.log("Received status: " + res.status);
      }
    });
  };
  return loadLast(date);
});
