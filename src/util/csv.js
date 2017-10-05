export function convert2CSV (table) {
  var csvContent = 'data:text/csv;charset=utf-8,'
  table.forEach((infoArray, index) => {
    var dataString = infoArray.join(',')
    csvContent += index < table.length ? dataString + '\n' : dataString
  })
  return encodeURI(csvContent)
}
