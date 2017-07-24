angular.module 'app.last', []

.controller 'Last', ($scope, $http, utils) ->
  date = new Date()
  date = if date.getHours < 14 then utils.prevValidDate date else date

  loadLast = (date) ->
    $http.get utils.mseUrl(date), { responseType: "arraybuffer" }
      .then (res) -> # success
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

        h = { }
        for r in [8 .. rcount]
          Ir = "I#{ r }"  # number of shares
          Ar = "A#{ r }"  # company name
          Br = "B#{ r }"  # average price per share (non-block)
          Hr = "H#{ r }"  # price per share for block trns
          continue unless ws[Ir]? # header/divider row
          continue if     ws[Ir].v <= 0
          unless h[ws[Ar].v]?
            h[ws[Ar].v] =
              price:  if ws[Br]? then ws[Br].v else ws[Hr].v
              shares: ws[Ir].v
              count:  1
          else
            h[ws[Ar].v].count++
            h[ws[Ar].v].price   += if ws[Br]? then ws[Br].v else ws[Hr].v
            h[ws[Ar].v].shares  += ws[Ir].v
        
        trns = [ ]
        total = 0
        for name in Object.keys(h).sort()
          trns.push {
            name:   name
            price:  h[name].price / h[name].count
            shares: h[name].shares
          }
          total += h[name].price / h[name].count * h[name].shares
        
        $scope.date = date
        $scope.trns = trns
        $scope.total = total
        console.log trns
      , (res) -> # 
        if res.status == 404 # file not found!
          loadLast prevValidDate(d)
        else
          console.log "Received status: #{ res.status }"

  loadLast date
