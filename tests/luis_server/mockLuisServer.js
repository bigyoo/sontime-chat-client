/**
 * Created by joe on 2016.06.06.
 *
 * It is a REST server in order to use as a mocked LUIS server in tests.
 */

var express = require('express');
var app = express();
var fs = require("fs");

/** port of the REST server */
var MOCK_LUIS_SERVER_PORT= 9876;
/** host of the REST server */
var MOCK_LUIS_SERVER_HOST= "localhost";
/** name of the REST endpoint, used as a LUIS service */
var MOCK_LUIS_SERVER_ENDPOINT= "/recognize";

/** The mocked LUIS server itself. */
var mockLuisServer = {
    MOCK_LUIS_SERVER_URL: "http://" + MOCK_LUIS_SERVER_HOST + ":" + MOCK_LUIS_SERVER_PORT + MOCK_LUIS_SERVER_ENDPOINT + "?foo=bar"
}


/**
 * Starts the REST server.
 * It will response with the given mocked response to any requests it receives.
 *
 * The given mockedResponse need to be a JSON object, similar to responses
 * of a real LUIS service.
 */
mockLuisServer.startServer = function(mockedResponse){
    // checks the mockedResponse whether it's defined
    if (!mockedResponse){
        throw new Error("You cannot start a mock LUIS server without defining a mocked response.");
    }

    // starts the REST server
    mockLuisServer.server = app.listen(MOCK_LUIS_SERVER_PORT, function () {

        var host = mockLuisServer.server.address().address
        var port = mockLuisServer.server.address().port

        console.log("Example app listening at http://%s:%s", host, port)

    });


    // defines and endpoint
    app.get(MOCK_LUIS_SERVER_ENDPOINT, function (req, res) {
        res.end(JSON.stringify(mockedResponse));
    })

}

module.exports = mockLuisServer;
