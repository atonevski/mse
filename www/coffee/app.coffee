# Ionic Starter App

# angular.module is a global place for creating, registering and retrieving
# Angular modules 'app' is the name of this angular module example (also set
# in a <body> attribute in index.html) the 2nd parameter is an array of
# 'requires'
angular.module 'app', ['ionic', 'ionic-datepicker', 'app.last',
      'app.by.date', 'app.by.week', 'app.by.month'] # don't forget your modules

.run ($ionicPlatform) ->
  $ionicPlatform.ready () ->
    if window.cordova and window.cordova.plugins.Keyboard
      # Hide the accessory bar by default (remove this to show the accessory
      # bar above the keyboard for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar true

      # Don't remove this line unless you know what you are doing. It stops
      # the viewport from snapping when text inputs are focused. Ionic handles
      # this internally for a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll true

    if window.StatusBar
      StatusBar.styleDefault()

.factory 'utils', () ->
  utils =
    # newer formats
    D_NEW_FMT: new Date(Date.parse '2018-08-03')

    daysBefore: (d, n) -> # returns n days before
      new Date(d.getTime() - n * 24 * 60 * 60 * 1000)
    daysAfter: (d, n) -> # returns n days before
      new Date(d.getTime() + n * 24 * 60 * 60 * 1000)
    startEndOfMonth: (d) ->
      start = new Date(d.getFullYear(), d.getMonth(), 1)
      end   = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      [start, end]

    # # obsole, changed for new url
    # fmtYMD: (d) -> # returns YYYYMMMDD for date d
    #   (new Date(d.getTime() - 60000*d.getTimezoneOffset()))
    #     .toISOString().slice(0, 10).replace /-/g, ""
    #

    fmtYMD: (d) ->
      d = new Date(Date.parse d) unless d instanceof Date
      sep = if arguments.length > 1 then arguments[1] else ''
      (new Date(d - d.getTimezoneOffset()*1000*60))
        .toISOString()[0..9]
        .split('-')
        .reverse()
        .join(sep)

    prevValidDate:  (d) ->
      switch d.getDay()
        when 0 then utils.daysBefore d, 2
        when 1 then utils.daysBefore d, 3
        else utils.daysBefore d, 1

    weekDays: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday" ]
    # # obsolete, but we'll use it for older dates
    # mseUrl: (d) -> # generate mse url for date d
    #   "http://www.mse.mk/Repository/Reports/MK/ReportMK_1_" +
    #   "#{ utils.fmtYMD d }_#{ utils.fmtYMD d }.xls"

    mseUrl: (d) -> # 3 url formats
      if d < utils.D_NEW_FMT
        "https://www.mse.mk/Repository/Reports/MK/ReportMK_1_" +
        "#{ utils.fmtYMD d }_#{ utils.fmtYMD d }.xls"
      else if d < (new Date(Date.parse '2019-01-01'))
        "https://www.mse.mk/Repository/Reports/MK_New/" +
        "#{ utils.fmtYMD d, '.' }mk.xls"
      else
        "https://www.mse.mk/Repository/Reports/#{ d.getFullYear() }/" +
        "#{ utils.fmtYMD d, '.' }mk.xls"

.config ($stateProvider, $urlRouterProvider) ->
  $stateProvider
    .state 'root', {
      url:          '/'
      templateUrl:  'views/home.html'
    }
    .state 'home', {
      url:          '/home'
      templateUrl:  'views/home.html'
    }
    .state 'last', {
      url:          '/last'
      templateUrl:  'views/last.html'
      controller:   'Last'
    }
    .state 'by-date', {
      url:          '/by-date'
      templateUrl:  'views/by-date.html'
      controller:   'ByDate'
    }
    .state 'by-week', {
      url:          '/by-week'
      templateUrl:  'views/by-week.html'
      controller:   'ByWeek'
    }
    .state 'by-month', {
      url:          '/by-month'
      templateUrl:  'views/by-month.html'
      controller:   'ByMonth'
    }

  $urlRouterProvider.otherwise '/home'

.controller 'Main', ($scope, utils) ->
  $scope.weekDays = utils.weekDays
  $scope.hour = (new Date()).getHours()

