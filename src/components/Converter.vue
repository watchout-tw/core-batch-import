<template>
  <div class="converter">
    <div class="row">
      <div class="col-md-8"></div>
      <div class="col-md-3">
        <div class="form-group pull-right" v-if="isLoggedIn">
          <img class="gakki" src="../assets/gakki.jpg">
        </div>
        <div v-else>
          <div class="form-group">
            <input type="text" class="form-control" v-model="handle" placeholder="沃草帳號">
          </div>
          <div class="form-group">
            <input type="password" class="form-control" v-model="password" placeholder="密碼">
          </div>
          <div class="form-group">
            <button class="btn btn-info" @click="watchoutLogin()">草民登入</button>
          </div>
        </div>
        <div class="form-group">
          <button class="btn btn-default" v-if="!showAuth && !loggedIn" @click="googleInit()">啟用 Google 登入</button>
          <button class="btn btn-default" v-if="showAuth" @click="handleAuthClick()">Google 登入</button>
        </div>
      </div>
      <div class="col-md-1"></div>
    </div>
    <h1>Core Batch Import</h1>
    <img src="../assets/logo.png">
    <div class="row">
      <div class="col-md-1"></div>
      <div class="col-md-3">
        <div class="form-group">
          <label for="sheetID">Sheet ID</label>
          <input type="text" name="sheetID" class="form-control" placeholder="1IzXuWgFsqu5AuNYreYVsElZ0T_PKj_4D2y0b0C7AAmA" v-model="sheetID">
        </div>
        <div class="form-group">
          <label for="sheetName">Sheet Name</label>
          <input type="text" name="sheetName" class="form-control" placeholder="罷免（第九屆第一會期）" v-model="sheetName">
        </div>
        <div class="form-group">
          <button class="btn btn-info" v-if="loggedIn && importData.length === 0" @click="readSpreadSheet()">讀取試算表</button>
        </div>
        <div class="form-group" v-if="downloadLink">
          <a v-bind:href="downloadLink"><button class="btn btn-warning">下載 CSV</button></a><br>
          <small>請先下載檢查再送出</small>
        </div>
        <div class="form-group">
          <button class="btn btn-danger" v-if="exportData.length > 0" @click="submitSheet()">送出至資料庫</button>
        </div>
      </div>
      <div class="col-md-7">
        <pre v-if="importData.length > 0">讀取完成！</pre>
        <pre v-if="exportData.length > 0">資料處理完成！</pre>
        <pre v-if="uploaded">上傳成功！</pre>
        <pre v-if="errorData.length > 0">處理失敗的資料：</br>{{errorData}}</pre>
        <pre v-if="errmsg">其它錯誤訊息：</br>{{errmsg}}</pre>
      </div>
      <div class="col-md-1"></div>
    </div>
  </div>
</template>

<script>
import * as googleConfig from '../../config/google'
import * as csv from '../util/csv'
import * as api from '../util/api'
import * as util from '../util'

/* global gapi:true */
export default {
  name: 'converter',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      showAuth: false,
      loggedIn: false,
      sheetID: '1IzXuWgFsqu5AuNYreYVsElZ0T_PKj_4D2y0b0C7AAmA',
      sheetName: '核四（第八屆）',
      errmsg: '',
      importData: [],
      exportData: [],
      errorData: [],
      downloadLink: null,
      handle: '',
      password: '',
      specificTopics: [],
      termSessions: [],
      reps: [],
      st_questions: [],
      isLoggedIn: util.isLoggedIn(),
      uploaded: false
    }
  },
  beforeMount () {
    gapi.load('client:auth2', this.initClient)
  },
  methods: {
    googleInit () {
      gapi.load('client:auth2', this.initClient)
    },
    watchoutLogin () {
      if (this.handle && this.password) {
        api.login({
          handle: this.handle,
          password: this.password
        }).then(response => {
          if (response.data.token) {
            localStorage.setItem('watchout-token', response.data.token)
          }
        }).catch(error => {
          console.error(error)
        })
      }
    },
    initClient () {
      gapi.client.init({
        apiKey: googleConfig.API_KEY,
        clientId: googleConfig.CLIENT_ID,
        discoveryDocs: googleConfig.DISCOVERY_DOCS,
        scope: googleConfig.SCOPES
      }).then(() => {
        console.info('Google API Client Initiated')
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus)

        // Handle the initial sign-in state.
        this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      }, function (error) {
        console.error(error)
      })
    },
    updateSigninStatus (isSignedIn) {
      if (isSignedIn) {
        this.loggedIn = true
        this.showAuth = false
      } else {
        this.showAuth = true
        this.loggedIn = false
      }
    },
    handleAuthClick (event) {
      gapi.auth2.getAuthInstance().signIn()
    },
    handleSignoutClick (event) {
      gapi.auth2.getAuthInstance().signOut()
    },
    readSpreadSheet () {
      if (!this.sheetID || !this.sheetName) {
        alert('Please Enter Sheet ID and Sheet Name')
        return
      }
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetID,
        range: this.sheetName + '!A:Z'
      }).then(response => {
        this.importData = response.result.values
        return api.getSpecificTopics()
      }).then(response => {
        this.specificTopics = response.data.rows
        return api.getTermSessions()
      }).then(response => {
        this.termSessions = response.data.rows
        return api.getReps()
      }).then(response => {
        this.reps = response.data.rows
        return api.getSTQuestions()
      }).then(response => {
        this.st_questions = response.data.rows
        this.importData.forEach(tuple => {
          var sanitized = {}
          try {
            sanitized.st_id = this.specificTopics.find(st => {
              return st.title === tuple[0]
            }).id
            sanitized.date = util.parseDate(tuple[3])
            var desiredTS = this.termSessions.find(ts => {
              var start = new Date(ts.start_date)
              var end = new Date(ts.end_date)
              return sanitized.date >= start.getTime() && sanitized.date <= end.getTime()
            })
            sanitized.term_index = desiredTS.term_index
            sanitized.session_index = desiredTS.session_index
            sanitized.temp_session_index = desiredTS.temp_session_index
            // After getting term_index, we can decide rep_party
            // Use rep history to get rep party
            var desiredRep = this.reps.find(rep => {
              return util.compareRepName(rep.name, tuple[1])
            })
            sanitized.rep_id = desiredRep.id
            sanitized.rep_party_id = desiredRep.history.find(history => {
              return history.term === sanitized.term_index
            }).party.id
            sanitized.content = tuple[4]
            sanitized.position_summary = tuple[5]
            sanitized.st_question_id = tuple[6]
            sanitized.position = util.mapPosition(tuple[7])
            sanitized.source_link = tuple[8]
            sanitized.principle_committee = tuple[9]
            if (tuple[10]) {
              sanitized.joint_committees = util.parseJointCommittees(tuple[10])
            }
            this.exportData.push(sanitized)
          } catch (e) {
            console.log(e)
            this.errorData.push(tuple)
          }
        })
        this.downloadLink = csv.convert2CSV(this.exportData)
        console.log('exportData', this.exportData)
        console.log('errorData', this.errorData)
      }).catch(error => {
        this.errmsg = 'Error: ' + error.result.error.message
      })
    },
    submitSheet () {
      var sheetPromises = []
      this.exportData.forEach(tuple => {
        sheetPromises.push(api.postRSStatement(tuple))
      })
      Promise.all(sheetPromises).then(response => {
        this.uploaded = true
        console.log(response)
      }).catch(error => {
        this.errmsg.concat('Post Data Error: ', error)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.gakki {
  height: 50px;
  width: 50px;
  border-radius: 50%;
}
</style>
