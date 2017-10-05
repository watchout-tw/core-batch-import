<template>
  <div class="hello">
    <h1>Core Batch Import</h1>
    <div class="row">
      <div class="col-md-1"></div>
      <div class="col-md-2">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Enter Sheet ID" v-model="sheetID">
        </div>
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Enter Sheet Name" v-model="sheetName">
        </div>
        <button class="btn btn-default" v-if="showAuth" @click="handleAuthClick()">Sign In</button>
        <button class="btn btn-default" v-if="!showAuth && !loggedIn" @click="googleInit()">Ready for Import</button>
        <button class="btn btn-default" v-if="loggedIn" @click="handleSignoutClick()">Sign Out</button>
        <button class="btn btn-info" v-if="loggedIn" @click="readSpreadSheet()">Read Data</button>
      </div>
      <div class="col-md-8">
        <pre>{{importData}}</pre>
        {{errmsg}}
      </div>
      <div class="col-md-1"></div>
    </div>
  </div>
</template>

<script>
import * as googleConfig from '../../config/google'
import * as csv from '../util/csv'
/* global gapi:true */
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      showAuth: false,
      loggedIn: false,
      sheetID: '',
      sheetName: '',
      errmsg: '',
      importData: []
    }
  },
  methods: {
    googleInit () {
      gapi.load('client:auth2', this.initClient)
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
        this.importData = response.result
        csv.convert2CSV(this.importData)
        // if (range.values.length > 0) {
        //   // console.log('Name, Major:')
        //   for (var i = 0; i < range.values.length; i++) {
        //     var row = range.values[i]
        //     // Print columns A and E, which correspond to indices 0 and 4.
        //     console.log(row[0] + ', ' + row[1])
        //   }
        // } else {
        //   console.log('No data found.')
        // }
      }, response => {
        this.errmsg = 'Error: ' + response.result.error.message
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
</style>
