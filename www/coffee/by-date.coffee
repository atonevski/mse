angular.module 'app.by.date', []

.controller 'ByDate', ($scope, ionicDatePicker, utils, $http, $ionicLoading) ->
  today = new Date()
  obj =
    # Mandatory
    callback: (v) ->
      v = new Date(v)
      console.log utils.fmtYMD(v)
      loadSales v

    disableWeekdays:  [0, 6] # sundays and saturdays
    from:             new Date(2012, 1, 1) # use official mse startup date
    to:               if today.getHours() < 14 then utils.prevValidDate(today) else today
    inputDate:        if today.getHours() < 14 then utils.prevValidDate(today) else today
    templateType:     'popup'
    mondayFirst:      yes
    closeOnSelect:    yes

  $scope.openDatePicker = () -> ionicDatePicker.openDatePicker obj

  $scope.changeColor = (t) ->
    switch
      when t == null   then # no coloring
      when t.raise < 0 then 'assertive'
      when t.raise > 0 then 'balanced'

  loadSales = (date) ->
    $scope.date = null
    $ionicLoading.show()
    $http.get utils.mseUrl(date), { responseType: "arraybuffer" }
      .then (res) -> # success
        $ionicLoading.hide() # stop busy indicator

        console.log "Successful load #{ d }"
        console.log res
        console.log utils.mseUrl(date)
        
        buf = res.data
        data= new Uint8Array(buf)
        arr = []
        arr[i] = String.fromCharCode(d) for i, d of data
        bstr = arr.join ''

        workbook  = XLSX.read bstr, { type: "binary" }
        ws        = workbook.Sheets.Sheet1
        rcount    = ws['!rows'].length
        console.log "Total rows: #{ rcount }"

        inbonds = no
        trns    = [ ]
        bonds   = [ ]
        change  = { win: 0, loss: 0, even: 0 }
        totals  = { trns: 0, bonds: 0 }
        for r in [4 .. rcount]
          Ar = "A#{ r }"  # company name
          Br = "B#{ r }"  # average price per share (non-block)
          Cr = "C#{ r }"  # raise percent
          Hr = "H#{ r }"  # price per share for block trns
          Ir = "I#{ r }"  # number of shares
          Jr = "J#{ r }"  # turnover (expressed in x1000)

          if ws[Ar].v.includes "обврзници"
            inbonds = yes
            continue

          inbonds = no  if inbonds and !ws[Jr]?
          continue if !ws[Ir]? or !ws[Jr]?
          continue if  ws[Ir].v <= 0
          unless inbonds
            trns.push {
              company:  ws[Ar].v
              raise:    if ws[Cr]? then ws[Cr].v else null
              turnover: ws[Jr].v * 1000
              shares:   ws[Ir].v
              price:    if !ws[Br]? then ws[Hr].v else ws[Br].v
            }
            switch
              when !ws[Cr]?      then
              when ws[Cr].v  < 0 then change.loss++
              when ws[Cr].v is 0 then change.even++
              when ws[Cr].v  > 0 then change.win++
            totals.trns += ws[Jr].v * 1000
          else
            bonds.push {
              title:    ws[Ar].v
              qty:      ws[Ir].v
              turnover: ws[Jr].v * 1000
              price:    ws[Br].v
            }
            totals.bonds += ws[Jr].v * 1000
         
        $scope.date   = date
        $scope.trns   = trns
        $scope.bonds  = bonds
        $scope.totals = totals
        $scope.change = change
        console.log trns
      , (res) -> # 
        $ionicLoading.show {
          template: "Can't download xls (#{ res.status }, #{ res.statusText })"
          duration: 3000
        }
        console.log "(by-date) Received status: #{ res.status }"

