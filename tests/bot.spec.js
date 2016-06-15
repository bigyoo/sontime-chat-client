const q = require('q');
const util = require('util');
var testBotWrapper = require('./bot_test_utils/testBotWrapper');
var botUnderTest = require('../app/bot/bot');
var prompts = require('../app/bot/prompts');


describe('bot understands login intent', function () {
    var mockLuisServer;

    beforeEach(function () {
        // starts a mock LUIS server
        mockLuisServer = require('./bot_test_utils/mockLuisServer');
        mockLuisServer.startServer();

        // starts a chat bot and wrapping it with a test helper,
        // to replace the 'real' connector bot with a TextBot
        testBotWrapper.start(botUnderTest, mockLuisServer.MOCK_LUIS_SERVER_URL);
    })

    afterEach(function () {
        mockLuisServer.stopServer();
        testBotWrapper.clearMessageHistory();
    })


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
        var inputMessage = {text: "my test input without login name and password"};

        // defines behavior of LUIS server
        mockLuisServer.when(inputMessage.text).then(mockLUISResponse);

        // ---------- act
        testBotWrapper.processMessage(inputMessage)
            .then(function (reply) {
                expect({text: prompts.login_intent_without_login_or_password}).toEqual(reply);
            })
            .delay(1000) // wait's unit the bot replies, this is an async operation
            .then(function () {
                expect({text: prompts.prompt_login_name}).toEqual(testBotWrapper.getLastReply());
            })
            .then(function () {
                done();
            });
    });

    it('should understand login intent with user name entity and prompt only for password', function (done) {
        // ------ arrange

        // mock response of LUIS server
        var username = "my-user-name";
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
            "entities": [
                {
                    "entity": username,
                    "type": "username",
                    "startIndex": 9,
                    "endIndex": 11,
                    "score": 0.992420435
                }
            ]
        };

        // test input message
        var inputMessage = {text: "my test input with a user name, but without a password"};

        // defines behavior of LUIS server
        mockLuisServer.when(inputMessage.text).then(mockLUISResponse);

        // ---------- act
        testBotWrapper.processMessage(inputMessage)
            .then(function (reply) {
                expect({text:prompts.login_intent_without_login_or_password}).toEqual(reply);
            })
            .delay(3000)
            .then(function () {
                expect([
                    {text: util.format(prompts.login_intent_with_login_but_without_password, username)},
                    {text: prompts.prompt_password}
                ]).toEqual(testBotWrapper.getReplyTexts());
            })
            .then(function () {
                done();
            });
    });

    it('should understand login intent with user name and password entities', function (done) {
        // ------ arrange

        // mock response of LUIS server
        var username = "my-user-name";
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
            "entities": [
                {
                    "entity": username,
                    "type": "username",
                    "startIndex": 9,
                    "endIndex": 11,
                    "score": 0.99
                },
                {
                    "entity": "my-password",
                    "type": "password",
                    "startIndex": 14,
                    "endIndex": 20,
                    "score": 0.99
                }
            ]
        };

        // test input message
        var inputMessage = {text: "my test input with a user name and a password"};

        // defines behavior of LUIS server
        mockLuisServer.when(inputMessage.text).then(mockLUISResponse);

        // ---------- act
        testBotWrapper.processMessage(inputMessage)
            .then(function (reply) {
                expect({text: util.format(prompts.login_intent_with_login_and_password, username)}).toEqual(reply);
            })
            .then(function () {
                done();
            });
    });
});

