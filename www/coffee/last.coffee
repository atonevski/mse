angular.module 'app.last', []

.controller 'Last', ($scope, $http, utils) ->
  date = new Date()
  date = if date.getHours < 14 then utils.prevValidDate date else date

  loadLast = (d) ->
    $http.get utils.mseUrl(d), { responseType: "arraybuffer" }
      .then (res) -> # success
        console.log "Successful load #{ d }"
        console.log res
        $scope.date = d.toISOString()
        
        buf = res.data
        data= new Uint8Array(buf)
        arr = []
        arr[i] = String.fromCharCode(d) for i, d of data
        bstr = arr.join ''

        workbook = XLSX.read bstr, { type: "binary" }
        ws = workbook.Sheets.Sheet1
        rcnt = ws['!rows'].length
        console.log "Total rows: #{ rcnt }"
        
      , (res) -> # 
        if res.status == 404 # file not found!
          loadLast prevValidDate(d)
        else
          console.log "Received status: #{ res.status }"

  loadLast date
