angular.module 'app.by.date', []

.controller 'ByDate', ($scope, ionicDatePicker, utils) ->
  today = new Date()
  obj =
    # Mandatory
    callback: (v) -> console.log "Return val from datepicker: #{ v }"
    disableWeekdays: [0, 6] # sundays and saturdays
    from: new Date(2012, 1, 1) # use official mse startup date
    to: if today.getHours() < 14 then utils.prevValidDate(today) else today
    inputDate: if today.getHours() < 14 then utils.prevValidDate(today) else today
    templateType: 'popup'
    mondayFirst: yes
    closeOnSelect: yes

  $scope.openDatePicker = () -> ionicDatePicker.openDatePicker obj
