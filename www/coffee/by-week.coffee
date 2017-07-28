angular.module 'app.by.week', []

.controller 'ByWeek', ($scope, $http, utils, ionicDatePicker, $q) ->
  today = new Date()
  obj =
    # Mandatory
    callback: (v) ->
      v = new Date(v)
      console.log utils.fmtYMD(v)
      today  = new Date()
      monday = utils.daysBefore v, v.getDay() - 1
      friday = utils.daysAfter v, 5 - v.getDay()
      friday = today if friday > today  # for current 
      # check if monday-friday extends current week
      console.log "week interval:", utils.fmtYMD(monday), "-", utils.fmtYMD(friday)
      console.log (monday < friday)

      date = monday
      while date <= friday
        console.log utils.fmtYMD(date)
        date = utils.daysAfter date, 1

    disableWeekdays:  [0, 6] # sundays and saturdays
    from:             new Date(2012, 1, 1) # use official mse startup date
    to:               if today.getHours() < 14 then utils.prevValidDate(today) else today
    inputDate:        if today.getHours() < 14 then utils.prevValidDate(today) else today
    templateType:     'popup'
    mondayFirst:      yes
    closeOnSelect:    yes

  $scope.openDatePicker = () -> ionicDatePicker.openDatePicker obj
  
  parseXML = (resdata) ->
    buf     = resdata
    data    = new Uint8Array(buf)
    arr     = []
    arr[i]  = String.fromCharCode(d) for i, d of data
    bstr    = arr.join ''

    # this should return workbook
    workbook  = XLSX.read bstr, { type: "binary" }
    # ws        = workbook.Sheets.Sheet1
    # rcount    = ws['!rows'].length  # needed for reading row-by-row



# deferred = []
# promises = []
#
# date = monday
#
# while date <= friday
#   d = $q.defer()
#   p = d.promise
#
#   deferred.push d
#   promises.push p
#
#   date = utils.daysAfter date, 1
#
# success = () -> ...
# error   = () -> ...
#
# $q.all promises
#   .then success, error
#
# for d in deferred
#   d.resolve ...
