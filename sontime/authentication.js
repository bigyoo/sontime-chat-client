// Rest servies for Sontime authentication
// =========================

var tools = require('../tools/tools');
// var  needle = require('needle')

// var Client = require('node-rest-client').Client;

var request = require('request');



var SONTIME_URL = 'https://support.sonrisa.hu/sontime2-service/rest/';

module.exports = {


  login: function () {


    // configure basic http auth for every request
    var options_auth = { user: "joe", password: "PASSWORD" };

      // set content-type header and data as json in args parameter
    var args = {
      auth: options_auth,

      uri: SONTIME_URL + "login",
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },

      json: {
         rememberMe:false
      }

      // data: { rememberMe:false },

    //  proxy: 'http://localhost:8888'
    }


    request.post(args, function (error, response, body) {
      if(error){
        tools.toConsole('------- data1: %s', error)
      }

      	// parsed response body as js object
        tools.toConsole('------- data1: %s', body)
      // raw response
          tools.toConsole('------------- response: %s', response)
          //response status
           tools.toConsole('------------- response status %s', response.statusCode)
    });

  }

}
