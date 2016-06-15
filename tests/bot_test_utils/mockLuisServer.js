/**
 * Created by joe on 2016.06.06.
 *
 * It is a REST server to replace 'real' LUIS server in unit tests.
 */

var express = require('express');
var url = require('url');
var app = express();


/** port of the REST server */
var MOCK_LUIS_SERVER_PORT= 9876;
/** host of the REST server */
var MOCK_LUIS_SERVER_HOST= "localhost";
/** name of the REST endpoint, used as a LUIS service */
var MOCK_LUIS_SERVER_ENDPOINT= "/recognize";

/** The mocked LUIS server itself. */
var mockLuisServer = {
    MOCK_LUIS_SERVER_URL: "http://" + MOCK_LUIS_SERVER_HOST + ":" + MOCK_LUIS_SERVER_PORT + MOCK_LUIS_SERVER_ENDPOINT + "?foo=bar",
    mockedResponses: [],
    lastlyAddedInput: ""
}

/**
 * When() and then() methods can be used as a fluent API to define
 * responses of mock LUIS server for given inputs.
 *
 * @param input
 * @returns {{MOCK_LUIS_SERVER_URL: string, mockedResponses: Array, lastlyAddedInput: string}}
 */
mockLuisServer.when = function(input){
    mockLuisServer.lastlyAddedInput = input;
    return mockLuisServer;
}
mockLuisServer.then = function(response) {
    mockLuisServer.mockedResponses[mockLuisServer.lastlyAddedInput] = response;
    mockLuisServer.lastlyAddedInput = null;
}


/**
 * Starts the REST server.
 * It will response with the given mocked response to any requests it receives.
 *
 * The given mockedResponses need to be a JSON map (key: input text, value: the desired response), similar to responses
 * of a real LUIS service.
 */
mockLuisServer.startServer = function(){

    // starts the REST server
    mockLuisServer.server = app.listen(MOCK_LUIS_SERVER_PORT, function () {

        var host = mockLuisServer.server.address().address;
        var port = mockLuisServer.server.address().port;

        console.log(">>> Mock LUIS server is listening at http://%s:%s", host, port)

    });
    enableDestroy(mockLuisServer.server);


    // defines and endpoint
    app.get(MOCK_LUIS_SERVER_ENDPOINT, function (req, res) {
        var inputText = getQueryString(req);
        res.end(JSON.stringify(mockLuisServer.mockedResponses[inputText]));
    })

}

/**
 * Stops mock LUIS server.
 *
 */
mockLuisServer.stopServer = function(){
    mockLuisServer.server.destroy();
}

/**
 * Enhance the given server with a 'destroy' function.
 */
function enableDestroy(server) {
    var connections = {}

    server.on('connection', function(conn) {
        var key = conn.remoteAddress + ':' + conn.remotePort;
        connections[key] = conn;
        conn.on('close', function() {
            delete connections[key];
        });
    });

    server.destroy = function(cb) {
        server.close(cb);
        for (var key in connections){
            connections[key].destroy();
        }
        console.log(">>> Destroying mock LUIS server.");
    };
}

module.exports = mockLuisServer;

/**
 * Returns the input text from the query parameters
 * receiver by the mock LUIS server.
 *
 * @param req
 * @returns the 'q' query parameter which
 *          is the input text the LUIS server need to process
 */
function getQueryString(req) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    return query.q;
}
