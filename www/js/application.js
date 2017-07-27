angular.module('app', ['ionic', 'ionic-datepicker', 'app.last', 'app.by.date']).run(function($ionicPlatform) {
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
      return (new Date(d.getTime() - 60000 * d.getTimezoneOffset())).toISOString().slice(0, 10).replace(/-/g, "");
    },
    prevValidDate: function(d) {
      switch (d.getDay()) {
        case 0:
          return utils.daysBefore(d, 2);
        case 1:
          return utils.daysBefore(d, 3);
        default:
          return utils.daysBefore(d, 1);
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
  }).state('by-date', {
    url: '/by-date',
    templateUrl: 'views/by-date.html',
    controller: 'ByDate'
  });
  return $urlRouterProvider.otherwise('/home');
}).controller('Main', function($scope, utils) {
  $scope.weekDays = utils.weekDays;
  return $scope.hour = (new Date()).getHours();
});

angular.module('app.by.date', []).controller('ByDate', function($scope, ionicDatePicker, utils, $http, $ionicLoading) {
  var loadSales, obj, today;
  today = new Date();
  obj = {
    callback: function(v) {
      v = new Date(v);
      console.log(utils.fmtYMD(v));
      return loadSales(v);
    },
    disableWeekdays: [0, 6],
    from: new Date(2012, 1, 1),
    to: today.getHours() < 14 ? utils.prevValidDate(today) : today,
    inputDate: today.getHours() < 14 ? utils.prevValidDate(today) : today,
    templateType: 'popup',
    mondayFirst: true,
    closeOnSelect: true
  };
  $scope.openDatePicker = function() {
    return ionicDatePicker.openDatePicker(obj);
  };
  $scope.changeColor = function(t) {
    switch (false) {
      case t !== null:
        break;
      case !(t.raise < -2):
        return 'assertive';
      case !(t.raise > +2):
        return 'balanced';
    }
  };
  return loadSales = function(date) {
    $scope.date = null;
    $ionicLoading.show();
    return $http.get(utils.mseUrl(date), {
      responseType: "arraybuffer"
    }).then(function(res) {
      var Ar, Br, Cr, Hr, Ir, Jr, arr, bonds, bstr, buf, change, d, data, i, inbonds, j, r, rcount, ref, totals, trns, workbook, ws;
      $ionicLoading.hide();
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
      inbonds = false;
      trns = [];
      bonds = [];
      change = {
        win: 0,
        loss: 0,
        even: 0
      };
      totals = {
        trns: 0,
        bonds: 0
      };
      for (r = j = 4, ref = rcount; 4 <= ref ? j <= ref : j >= ref; r = 4 <= ref ? ++j : --j) {
        Ar = "A" + r;
        Br = "B" + r;
        Cr = "C" + r;
        Hr = "H" + r;
        Ir = "I" + r;
        Jr = "J" + r;
        if (ws[Ar].v.includes("обврзници")) {
          inbonds = true;
          continue;
        }
        if (inbonds && (ws[Jr] == null)) {
          inbonds = false;
        }
        if ((ws[Ir] == null) || (ws[Jr] == null)) {
          continue;
        }
        if (ws[Ir].v <= 0) {
          continue;
        }
        if (!inbonds) {
          trns.push({
            company: ws[Ar].v,
            raise: ws[Cr] != null ? ws[Cr].v : null,
            turnover: ws[Jr].v * 1000,
            shares: ws[Ir].v,
            price: ws[Br] == null ? ws[Hr].v : ws[Br].v
          });
          switch (false) {
            case !(ws[Cr] == null):
              break;
            case !(ws[Cr].v < 0):
              change.loss++;
              break;
            case ws[Cr].v !== 0:
              change.even++;
              break;
            case !(ws[Cr].v > 0):
              change.win++;
          }
          totals.trns += ws[Jr].v * 1000;
        } else {
          bonds.push({
            title: ws[Ar].v,
            qty: ws[Ir].v,
            turnover: ws[Jr].v * 1000,
            price: ws[Br].v
          });
          totals.bonds += ws[Jr].v * 1000;
        }
      }
      $scope.date = date;
      $scope.trns = trns;
      $scope.bonds = bonds;
      $scope.totals = totals;
      $scope.change = change;
      return console.log(trns);
    }, function(res) {
      $ionicLoading.show({
        template: "Can't download xls (" + res.status + ", " + res.statusText + ")",
        duration: 3000
      });
      return console.log("(by-date) Received status: " + res.status);
    });
  };
});

angular.module('app.last', []).controller('Last', function($scope, $http, utils, $ionicLoading) {
  var date, loadLast;
  date = new Date();
  date = date.getHours() < 14 ? utils.prevValidDate(date) : date;
  loadLast = function(date) {
    $ionicLoading.show();
    return $http.get(utils.mseUrl(date), {
      responseType: "arraybuffer"
    }).then(function(res) {
      var Ar, Br, Cr, Hr, Ir, Jr, arr, bonds, bstr, buf, change, d, data, i, inbonds, j, r, rcount, ref, totals, trns, workbook, ws;
      $ionicLoading.hide();
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
      inbonds = false;
      trns = [];
      bonds = [];
      change = {
        win: 0,
        loss: 0,
        even: 0
      };
      totals = {
        trns: 0,
        bonds: 0
      };
      for (r = j = 4, ref = rcount; 4 <= ref ? j <= ref : j >= ref; r = 4 <= ref ? ++j : --j) {
        Ar = "A" + r;
        Br = "B" + r;
        Cr = "C" + r;
        Hr = "H" + r;
        Ir = "I" + r;
        Jr = "J" + r;
        if (ws[Ar].v.includes("обврзници")) {
          inbonds = true;
          continue;
        }
        if (inbonds && (ws[Jr] == null)) {
          inbonds = false;
        }
        if ((ws[Ir] == null) || (ws[Jr] == null)) {
          continue;
        }
        if (ws[Ir].v <= 0) {
          continue;
        }
        if (!inbonds) {
          trns.push({
            company: ws[Ar].v,
            raise: ws[Cr] != null ? ws[Cr].v : null,
            turnover: ws[Jr].v * 1000,
            shares: ws[Ir].v,
            price: ws[Br] == null ? ws[Hr].v : ws[Br].v
          });
          switch (false) {
            case !(ws[Cr] == null):
              break;
            case !(ws[Cr].v < 0):
              change.loss++;
              break;
            case ws[Cr].v !== 0:
              change.even++;
              break;
            case !(ws[Cr].v > 0):
              change.win++;
          }
          totals.trns += ws[Jr].v * 1000;
        } else {
          bonds.push({
            title: ws[Ar].v,
            qty: ws[Ir].v,
            turnover: ws[Jr].v * 1000,
            price: ws[Br].v
          });
          totals.bonds += ws[Jr].v * 1000;
        }
      }
      $scope.date = date;
      $scope.trns = trns;
      $scope.bonds = bonds;
      $scope.totals = totals;
      $scope.change = change;
      return console.log(trns);
    }, function(res) {
      $ionicLoading.show({
        template: "Can't download xls (" + res.status + ", " + res.statusText + ")",
        duration: 3000
      });
      if (res.status === 404) {
        return loadLast(utils.prevValidDate(date));
      } else {
        return console.log("Received status: " + res.status);
      }
    });
  };
  loadLast(date);
  return $scope.changeColor = function(t) {
    switch (false) {
      case t !== null:
        break;
      case !(t.raise < -2):
        return 'assertive';
      case !(t.raise > +2):
        return 'balanced';
    }
  };
});
