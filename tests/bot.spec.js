var q = require('q');
var testBotWrapper = require('./bot_test_utils/testBotWrapper');
var botUnderTest = require('../app/bot');


describe('bot', function () {
    it('should understand login intent and prompt for credentials', function (done) {
        // ------ arrange

        // mock response of LUIS server
        var mockLUISResponse = {
            "query": "login",
            "intents": [
                {
                    "intent": "Login",
                    "score": 0.974588335
                },
                {
                    "intent": "None",
                    "score": 0.0855732039
                },
                {
                    "intent": "Logout",
                    "score": 0.002557724
                }
            ],
            "entities": []
        };

        // test input message
        var inputMessage = {text: "my test input"};


        // starts a mock LUIS server and defines its behavior
        var mockLuisServer = require('./bot_test_utils/mockLuisServer');
        mockLuisServer.when(inputMessage.text).then(mockLUISResponse);
        mockLuisServer.startServer();

        // starts a chat bot and wrapping it with a test helper,
        // to replace the 'real' connector bot with a TextBot
        testBotWrapper.start(botUnderTest, mockLuisServer.MOCK_LUIS_SERVER_URL);


        // ---------- act & assert in callback method
        testBotWrapper.processMessage(inputMessage, function(err, reply){
            expect(reply).toEqual({text:'I think you\'d like to login to Sontime, but I don\'t know your full credentials.'});
            mockLuisServer.stopServer();
            // testBotWrapper.logMessages();
            done();

            // TODO: chat bot tries to continue this dialogue with a question, but the tests ends before the next message arrives (see console)
        });
    });
});
