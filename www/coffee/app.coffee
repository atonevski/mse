# Ionic Starter App

# angular.module is a global place for creating, registering and retrieving
# Angular modules 'app' is the name of this angular module example (also set
# in a <body> attribute in index.html) the 2nd parameter is an array of
# 'requires'
angular.module 'app', ['ionic', 'app.last'] # don't forget your modules

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
    daysBefore: (d, n) -> # returns n days before
      new Date(d.getTime() - n * 24 * 60 * 60 * 1000)
    fmtYMD: (d) -> # returns YYYYMMMDD for date d
      d.toISOString().slice(0, 10).replace /-/g, ""
    prevValidDate:  (d) ->
      switch d.getDay()
        when 0 then daysBefore d, 2
        when 1 then daysBefore d, 3
        else daysBefore d, 1
    weekDays: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday" ]
    mseUrl: (d) -> # generate mse url for date d
      "http://www.mse.mk/Repository/Reports/MK/ReportMK_1_" +
      "#{ utils.fmtYMD d }_#{ utils.fmtYMD d }.xls"

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

  $urlRouterProvider.otherwise '/home'

.controller 'Main', ($scope, utils) ->
  $scope.weekDays = utils.weekDays
  $scope.hour = (new Date()).getHours()

