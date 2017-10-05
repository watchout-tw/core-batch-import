<template>
  <div class="hello">
    <h1>Core Batch Import</h1>
    <div class="row">
      <div class="col-md-4">
      </div>
      <div class="col-md-4">
        <div class="form-group">
          <input type="text" class="form-control" placeholder="Enter Sheet ID" @v-model="sheetID">
        </div>
        <button class="btn btn-default" v-if="showAuth" @click="handleAuthClick()">Authorize</button>
        <button class="btn btn-default" v-if="showSignout" @click="handleSignoutClick()">Sign Out</button>
        <button class="btn btn-default" @click="appStart()">appStart</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as googleConfig from '../../config/google'
/* global gapi:true */
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      showAuth: false,
      showSignout: false,
      sheetID: ''
    }
  },
  methods: {
    appStart () {
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
        console.log(error)
      })
    },
    updateSigninStatus (isSignedIn) {
      if (isSignedIn) {
        this.showAuth = false
        this.showSignout = true
        this.listMajors()
      } else {
        this.showAuth = true
        this.showSignout = false
      }
    },
    handleAuthClick (event) {
      gapi.auth2.getAuthInstance().signIn()
    },
    handleSignoutClick (event) {
      gapi.auth2.getAuthInstance().signOut()
    },
    listMajors () {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetID,
        range: '罷免!A:E'
      }).then(response => {
        var range = response.result
        if (range.values.length > 0) {
          console.log('Name, Major:')
          for (var i = 0; i < range.values.length; i++) {
            var row = range.values[i]
            // Print columns A and E, which correspond to indices 0 and 4.
            console.log(row[0] + ', ' + row[1])
          }
        } else {
          console.log('No data found.')
        }
      }, response => {
        console.log('Error: ' + response.result.error.message)
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
