angular.module 'app.by.month', []

.controller 'ByMonth', ($scope, $http, utils, ionicDatePicker,
                       $ionicLoading, $q) ->
  company = { }
  bonds   = { }
  change  = { win: 0, loss: 0, even: 0 }
  totals  = { companies: 0, bonds: 0 }

  processWbooks = (wbs) ->
    for wb in wbs
      ws      = wb.Sheets.Sheet1
      rcount  = ws['!rows'].length
      inbonds = no
      for r in [4 .. rcount]
        date = mkToDate ws['A2'].v.slice(ws['A2'].v.length - 10)
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
          unless company[ws[Ar].v]?
            company[ws[Ar].v] = []
              
          company[ws[Ar].v].push {
            date:     date
            # company:  ws[Ar].v
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
          totals.companies += ws[Jr].v * 1000
        else
          unless bonds[ws[Ar].v]?
            bonds[ws[Ar].v] = []
          bonds[ws[Ar].v].push {
            date:     date
            # title:    ws[Ar].v
            qty:      ws[Ir].v
            turnover: ws[Jr].v * 1000
            price:    ws[Br].v
          }
          totals.bonds += ws[Jr].v * 1000

  parseXLS  = (res) ->
    buf     = res.data
    data    = new Uint8Array(buf)
    arr     = []
    arr[i]  = String.fromCharCode(d) for i, d of data
    bstr    = arr.join ''

    XLSX.read bstr, { type: "binary" } # retrun workbook

  mkToDate = (s) -> # 'dd.mm.yyyy' to Date
    a = s.split('.').reverse().map (e) -> parseInt e
    new Date(a[0], a[1]-1, a[2])

  # date picker
  today = new Date()
  obj =
    # Mandatory
    callback: (v) ->
      v = new Date(v)
      console.log utils.fmtYMD(v)
      today  = new Date()
      [from, to] = utils.startEndOfMonth v
      to = today if to > today
      console.log "start, end:", from, to

      # reset values
      company = { }
      bonds   = { }
      change  = { win: 0, loss: 0, even: 0 }
      totals  = { companies: 0, bonds: 0 }

      ndays = 0
      date  = from
      promises = []
      $ionicLoading.show()
      while date <= to
        # skip saturdays and sundays
        if date.getDay() == 0 or date.getDay() == 6
          date = utils.daysAfter date, 1
          continue
        p = $http.get(utils.mseUrl(date), { responseType: "arraybuffer" })
        p = p.catch (e) -> null # catch errors (404)
        promises.push p
        date = utils.daysAfter date, 1
        ndays++
      all = $q.all promises
      wbs = []
      all
      .then (res) -> # successes
        for r in res
          continue unless r # skip 404
          wbs.push parseXLS r
        processWbooks wbs

        $ionicLoading.hide()
        # console.log company
        $scope.company  = company
        $scope.bonds    = bonds
        $scope.totals   = totals
        $scope.change   = change
        $scope.from     = from
        $scope.to       = to
      , (res) -> # errors
        $ionicLoading.show {
          template: "Can't download xls (#{ res.status }, #{ res.statusText })"
          duration: 3000
        }
        console.log "Load errors:"
        console.log res

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

  $scope.totalShares = (trns) ->
    total = 0
    total += t.shares for t in trns
    total

  $scope.totalTurnover = (trns) ->
    total = 0
    total += t.turnover for t in trns
    total
