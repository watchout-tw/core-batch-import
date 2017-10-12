export function convert2CSV (table) {
  var csvContent = 'data:text/csv;charset=utf-8,'
  table.forEach((tuple, index) => {
    var dataString = ''
    Object.keys(tuple).forEach((prop, index) => {
      dataString += index < Object.keys(tuple).length ? tuple[prop] + ',' : tuple[prop]
    })
    csvContent += index < table.length ? dataString + '\n' : dataString
  })
  return encodeURI(csvContent)
}
