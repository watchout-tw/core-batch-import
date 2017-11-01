const trimRegex = /[\s\u00B7\u0020\uFF65]/g

export function parseDate (date) {
  if (!date) throw new Error()
  var parsedDate
  if (date.indexOf('/') > 0) {
    parsedDate = new Date(date)
  } else {
    var TaiwanYear = date.substr(0, 3)
    var month = date.substr(3, 2)
    var day = date.substr(5, 2)
    parsedDate = new Date(parseInt(TaiwanYear, 10) + 1911, parseInt(month), parseInt(day))
  }
  return parsedDate.getTime()
}

export function mapPosition (pos) {
  if (!pos) throw new Error()
  var mappedPos
  if (pos === '贊成') {
    mappedPos = 'pro'
  } else if (pos === '反對') {
    mappedPos = 'against'
  } else if (pos === '模糊') {
    mappedPos = 'ambiguous'
  } else {
    throw new Error('Position not mapped')
  }
  return mappedPos
}

export function parseJointCommittees (jcs) {
  if (!jcs) throw new Error()
  return jcs.split('\n')
}

export function isLoggedIn () {
  return localStorage.getItem('watchout-token')
}

export function compareRepName (a, b) {
  if (a.length <= 3 || b.length <= 3) return a === b
  else return a.replace(trimRegex, '') === b.replace(trimRegex, '')
}

export function parseSTQuestionID (stqID) {
  if (!stqID) throw new Error()
  var parsedID = parseInt(stqID, 10)
  if (isNaN(parsedID)) throw new Error('st question id should be number')
  else return parsedID
}
