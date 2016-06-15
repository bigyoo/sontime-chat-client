/**
 * Created by joe on 2016.06.15..
 */
var builder = require('botbuilder');
var q = require('q');

var testBotWrapper = {
    receivedMessages: [],
    repliedMessages: [],
    sentMessages: []
}


/**
 * Starts a new but, using the given LUIS url,
 * but it replaces the bot instance with a text bot
 * (which reads inputs from standard input)
 * to make testing easier.
 *
 * @param luisUrl
 */
testBotWrapper.start = function (botUnderTest, luisUrl) {
    // replaces the 'real' LUIS url with this new one, used only in tests
    botUnderTest.LUIS_URL = luisUrl;
    // replacex the botInstance with a simple TextBot to be able to test it
    botUnderTest.botInstance = new builder.TextBot();
    botUnderTest.setupBot();

    // the wrapper keeps a reference to the bot instance
    testBotWrapper.botInstance = botUnderTest.botInstance;

    // the wrapper registers its own event listeners on bot instance
    // in order to be notified on messages
    testBotWrapper.registerEventListeners(botUnderTest.botInstance);
}

/**
 * Registers event listeners on bot instance.
 * The listeners will add every message to the appropriate message history array.
 *
 * @param botInstance
 */
testBotWrapper.registerEventListeners = function (botInstance) {
    function onMessage(message) {
        keepMessage(testBotWrapper.receivedMessages, message);
    }
    function onReply(message) {
        keepMessage(testBotWrapper.repliedMessages, message);
    }
    function onSend(message) {
        keepMessage(testBotWrapper.sentMessages, message);
    }

    botInstance.on('message', onMessage);
    botInstance.on('reply', onReply);
    botInstance.on('send', onSend);
}

/**
 * Logs to console all the received and sent messages.
 *
 */
testBotWrapper.logMessages = function () {
    console.log("RECEIVED MESSAGES: " + testBotWrapper.receivedMessages);
    console.log("REPLIED MESSAGES: " + testBotWrapper.repliedMessages);
    console.log("SENT MESSAGES: " + testBotWrapper.sentMessages);
}

/**
 * Simple wrapper method to hide inner bot instance,
 * and make easier to process messages.
 *
 * @param message
 * @param callback
 */
testBotWrapper.processMessage = function (message){
    var deferred = q.defer();
    testBotWrapper.botInstance.processMessage(message, function (error, text) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(text);
        }
    });
    return deferred.promise;
}

module.exports = testBotWrapper;

/**
 * Adds the given message to the given array.
 *
 * @param messageHistoryArray
 * @param message
 */
function keepMessage(messageHistoryArray, message) {
    messageHistoryArray[messageHistoryArray.length] = message.text;
    console.log("onSend: " + message.text);
}
