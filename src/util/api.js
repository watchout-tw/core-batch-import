import axios from 'axios'

const token = localStorage.getItem('watchout-token')
if (token) {
  axios.defaults.headers.common['Authorization'] = token
} else {
  console.error('Token not found')
}

export function getSpecificTopics () {
  let url = '/console/lab/specific_topics'
  return axios.get(url)
}

export function getReps () {
  let url = '/console/lab/reps?all'
  return axios.get(url)
}

export function getTermSessions () {
  let url = '/console/lab/term_sessions'
  return axios.get(url)
}

export function getParties () {
  let url = '/console/lab/parties'
  return axios.get(url)
}

export function getSTQuestions () {
  let url = '/console/lab/st_questions'
  return axios.get(url)
}

export function postRSStatement (reqObj) {
  let url = '/console/lab/rs_statements'
  return axios.post(url, reqObj)
}

export function login (loginObj) {
  let url = '/auth/login'
  return axios.post(url, loginObj)
}
