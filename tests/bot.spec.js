var q = require('q');
var builder = require('botbuilder');
var tools = require('../app/tools');

describe('bot', function () {
    it('should understand login intent and prompt for credentials', function (done) {
        // ------ arrange
        var mockedResponse = {
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

        // starts a mock LUIS server
        var mockLuisServer = require('./luis_server/mockLuisServer');
        mockLuisServer.startServer(mockedResponse);




        // starts a chat bot with simple text input
       var bot = startATextBot(mockLuisServer.MOCK_LUIS_SERVER_URL);

        // ---------- act
        var message = {
            text: "my test input",
            from: {
                address: "from-address"
            }

        };
        
        // bot.botInstance.emit("send", message);

        bot.botInstance.processMessage(message, function (error, reply) {
            // ---------- assert
            expect(reply).toEqual({text:'I think you\'d like to login to Sontime, but I don\'t know your full credentials.'});

            // --------- tear down
            // bot.botInstance.processMessage({text: "/quit", from: "from-address"});
            mockLuisServer.stopServer();
            // bot.botInstance.endDialog();
            // console.log(bot.botInstance);
            done();
        });
    });
});

/**
 * Starts a new but, using the given LUIS url,
 * but it replaces the bot instance with a text bot
 * (which reads inputs from standard input)
 * to make testing easier.
 *
 * @param luisUrl
 */
var startATextBot = function(luisUrl){
    var bot = require('../app/bot');
    bot.LUIS_URL = luisUrl;
    bot.botInstance = new builder.TextBot();
    bot.setupBot();
    bot.botInstance.listenStdin();

    return bot;
}