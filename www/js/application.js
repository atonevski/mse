angular.module('app', ['ionic', 'ionic-datepicker', 'app.last', 'app.by.date', 'app.by.week', 'app.by.month']).run(function($ionicPlatform) {
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
    D_NEW_FMT: new Date(Date.parse('2018-08-03')),
    daysBefore: function(d, n) {
      return new Date(d.getTime() - n * 24 * 60 * 60 * 1000);
    },
    daysAfter: function(d, n) {
      return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
    },
    startEndOfMonth: function(d) {
      var end, start;
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return [start, end];
    },
    fmtYMD: function(d) {
      var sep;
      if (!(d instanceof Date)) {
        d = new Date(Date.parse(d));
      }
      sep = arguments.length > 1 ? arguments[1] : '';
      return (new Date(d - d.getTimezoneOffset() * 1000 * 60)).toISOString().slice(0, 10).split('-').reverse().join(sep);
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
      if (d < utils.D_NEW_FMT) {
        return "https://www.mse.mk/Repository/Reports/MK/ReportMK_1_" + ((utils.fmtYMD(d)) + "_" + (utils.fmtYMD(d)) + ".xls");
      } else if (d < (new Date(Date.parse('2019-01-01')))) {
        return "https://www.mse.mk/Repository/Reports/MK_New/" + ((utils.fmtYMD(d, '.')) + "mk.xls");
      } else {
        return ("https://www.mse.mk/Repository/Reports/" + (d.getFullYear()) + "/") + ((utils.fmtYMD(d, '.')) + "mk.xls");
      }
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
  }).state('by-week', {
    url: '/by-week',
    templateUrl: 'views/by-week.html',
    controller: 'ByWeek'
  }).state('by-month', {
    url: '/by-month',
    templateUrl: 'views/by-month.html',
    controller: 'ByMonth'
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
      case !(t.raise < 0):
        return 'assertive';
      case !(t.raise > 0):
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

angular.module('app.by.month', []).controller('ByMonth', function($scope, $http, utils, ionicDatePicker, $ionicLoading, $q) {
  var bonds, change, company, mkToDate, obj, parseXLS, processWbooks, today, totals;
  company = {};
  bonds = {};
  change = {
    win: 0,
    loss: 0,
    even: 0
  };
  totals = {
    companies: 0,
    bonds: 0
  };
  processWbooks = function(wbs) {
    var Ar, Br, Cr, Hr, Ir, Jr, date, inbonds, j, len, r, rcount, results, wb, ws;
    results = [];
    for (j = 0, len = wbs.length; j < len; j++) {
      wb = wbs[j];
      ws = wb.Sheets.Sheet1;
      rcount = ws['!rows'].length;
      inbonds = false;
      results.push((function() {
        var k, ref, results1;
        results1 = [];
        for (r = k = 4, ref = rcount; 4 <= ref ? k <= ref : k >= ref; r = 4 <= ref ? ++k : --k) {
          date = mkToDate(ws['A2'].v.slice(ws['A2'].v.length - 10));
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
            if (company[ws[Ar].v] == null) {
              company[ws[Ar].v] = [];
            }
            company[ws[Ar].v].push({
              date: date,
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
            results1.push(totals.companies += ws[Jr].v * 1000);
          } else {
            if (bonds[ws[Ar].v] == null) {
              bonds[ws[Ar].v] = [];
            }
            bonds[ws[Ar].v].push({
              date: date,
              qty: ws[Ir].v,
              turnover: ws[Jr].v * 1000,
              price: ws[Br].v
            });
            results1.push(totals.bonds += ws[Jr].v * 1000);
          }
        }
        return results1;
      })());
    }
    return results;
  };
  parseXLS = function(res) {
    var arr, bstr, buf, d, data, i;
    buf = res.data;
    data = new Uint8Array(buf);
    arr = [];
    for (i in data) {
      d = data[i];
      arr[i] = String.fromCharCode(d);
    }
    bstr = arr.join('');
    return XLSX.read(bstr, {
      type: "binary"
    });
  };
  mkToDate = function(s) {
    var a;
    a = s.split('.').reverse().map(function(e) {
      return parseInt(e);
    });
    return new Date(a[0], a[1] - 1, a[2]);
  };
  today = new Date();
  obj = {
    callback: function(v) {
      var all, date, from, ndays, p, promises, ref, to, wbs;
      v = new Date(v);
      console.log(utils.fmtYMD(v));
      today = new Date();
      ref = utils.startEndOfMonth(v), from = ref[0], to = ref[1];
      if (to > today) {
        to = today;
      }
      console.log("start, end:", from, to);
      company = {};
      bonds = {};
      change = {
        win: 0,
        loss: 0,
        even: 0
      };
      totals = {
        companies: 0,
        bonds: 0
      };
      ndays = 0;
      date = from;
      promises = [];
      $ionicLoading.show();
      while (date <= to) {
        if (date.getDay() === 0 || date.getDay() === 6) {
          date = utils.daysAfter(date, 1);
          continue;
        }
        p = $http.get(utils.mseUrl(date), {
          responseType: "arraybuffer"
        });
        p = p["catch"](function(e) {
          return null;
        });
        promises.push(p);
        date = utils.daysAfter(date, 1);
        ndays++;
      }
      all = $q.all(promises);
      wbs = [];
      return all.then(function(res) {
        var j, len, r;
        for (j = 0, len = res.length; j < len; j++) {
          r = res[j];
          if (!r) {
            continue;
          }
          wbs.push(parseXLS(r));
        }
        processWbooks(wbs);
        $ionicLoading.hide();
        $scope.company = company;
        $scope.bonds = bonds;
        $scope.totals = totals;
        $scope.change = change;
        $scope.from = from;
        return $scope.to = to;
      }, function(res) {
        $ionicLoading.show({
          template: "Can't download xls (" + res.status + ", " + res.statusText + ")",
          duration: 3000
        });
        console.log("Load errors:");
        return console.log(res);
      });
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
      case !(t.raise < 0):
        return 'assertive';
      case !(t.raise > 0):
        return 'balanced';
    }
  };
  $scope.totalShares = function(trns) {
    var j, len, t, total;
    total = 0;
    for (j = 0, len = trns.length; j < len; j++) {
      t = trns[j];
      total += t.shares;
    }
    return total;
  };
  return $scope.totalTurnover = function(trns) {
    var j, len, t, total;
    total = 0;
    for (j = 0, len = trns.length; j < len; j++) {
      t = trns[j];
      total += t.turnover;
    }
    return total;
  };
});

angular.module('app.by.week', []).controller('ByWeek', function($scope, $http, utils, ionicDatePicker, $ionicLoading, $q) {
  var bonds, change, company, mkToDate, obj, parseXLS, processWbooks, today, totals;
  company = {};
  bonds = {};
  change = {
    win: 0,
    loss: 0,
    even: 0
  };
  totals = {
    companies: 0,
    bonds: 0
  };
  processWbooks = function(wbs) {
    var Ar, Br, Cr, Hr, Ir, Jr, date, inbonds, j, len, r, rcount, results, wb, ws;
    results = [];
    for (j = 0, len = wbs.length; j < len; j++) {
      wb = wbs[j];
      ws = wb.Sheets.Sheet1;
      rcount = ws['!rows'].length;
      inbonds = false;
      results.push((function() {
        var k, ref, results1;
        results1 = [];
        for (r = k = 4, ref = rcount; 4 <= ref ? k <= ref : k >= ref; r = 4 <= ref ? ++k : --k) {
          date = mkToDate(ws['A2'].v.slice(ws['A2'].v.length - 10));
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
            if (company[ws[Ar].v] == null) {
              company[ws[Ar].v] = [];
            }
            company[ws[Ar].v].push({
              date: date,
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
            results1.push(totals.companies += ws[Jr].v * 1000);
          } else {
            if (bonds[ws[Ar].v] == null) {
              bonds[ws[Ar].v] = [];
            }
            bonds[ws[Ar].v].push({
              date: date,
              qty: ws[Ir].v,
              turnover: ws[Jr].v * 1000,
              price: ws[Br].v
            });
            results1.push(totals.bonds += ws[Jr].v * 1000);
          }
        }
        return results1;
      })());
    }
    return results;
  };
  parseXLS = function(res) {
    var arr, bstr, buf, d, data, i;
    buf = res.data;
    data = new Uint8Array(buf);
    arr = [];
    for (i in data) {
      d = data[i];
      arr[i] = String.fromCharCode(d);
    }
    bstr = arr.join('');
    return XLSX.read(bstr, {
      type: "binary"
    });
  };
  mkToDate = function(s) {
    var a;
    a = s.split('.').reverse().map(function(e) {
      return parseInt(e);
    });
    return new Date(a[0], a[1] - 1, a[2]);
  };
  today = new Date();
  obj = {
    callback: function(v) {
      var all, date, friday, monday, ndays, p, promises, wbs;
      v = new Date(v);
      console.log(utils.fmtYMD(v));
      today = new Date();
      monday = utils.daysBefore(v, v.getDay() - 1);
      friday = utils.daysAfter(v, 5 - v.getDay());
      if (friday > today) {
        friday = today;
      }
      company = {};
      bonds = {};
      change = {
        win: 0,
        loss: 0,
        even: 0
      };
      totals = {
        companies: 0,
        bonds: 0
      };
      ndays = 0;
      date = monday;
      promises = [];
      $ionicLoading.show();
      while (date <= friday) {
        p = $http.get(utils.mseUrl(date), {
          responseType: "arraybuffer"
        });
        p = p["catch"](function(e) {
          return null;
        });
        promises.push(p);
        date = utils.daysAfter(date, 1);
        ndays++;
      }
      all = $q.all(promises);
      wbs = [];
      return all.then(function(res) {
        var j, len, r;
        for (j = 0, len = res.length; j < len; j++) {
          r = res[j];
          if (!r) {
            continue;
          }
          wbs.push(parseXLS(r));
        }
        processWbooks(wbs);
        $ionicLoading.hide();
        $scope.company = company;
        $scope.bonds = bonds;
        $scope.totals = totals;
        $scope.change = change;
        $scope.from = monday;
        return $scope.to = friday;
      }, function(res) {
        $ionicLoading.show({
          template: "Can't download xls (" + res.status + ", " + res.statusText + ")",
          duration: 3000
        });
        console.log("Load errors:");
        return console.log(res);
      });
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
      case !(t.raise < 0):
        return 'assertive';
      case !(t.raise > 0):
        return 'balanced';
    }
  };
  $scope.totalShares = function(trns) {
    var j, len, t, total;
    total = 0;
    for (j = 0, len = trns.length; j < len; j++) {
      t = trns[j];
      total += t.shares;
    }
    return total;
  };
  return $scope.totalTurnover = function(trns) {
    var j, len, t, total;
    total = 0;
    for (j = 0, len = trns.length; j < len; j++) {
      t = trns[j];
      total += t.turnover;
    }
    return total;
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
      case !(t.raise < 0):
        return 'assertive';
      case !(t.raise > 0):
        return 'balanced';
    }
  };
});
