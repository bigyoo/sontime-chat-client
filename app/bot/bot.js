'use strict';

var builder = require('botbuilder');
var restify = require('restify');
var util = require('util');
var prompts = require('./prompts');

// Create bot
var sontimeChatBot = {
    botInstance: new builder.BotConnectorBot({appId: 'YourAppId', appSecret: 'YourAppSecret'}),
    LUIS_URL: "https://api.projectoxford.ai/luis/v1/application?id=1bb1085a-f7b1-4f91-9e37-e9a8f10dd7e3&subscription-key=c35fcb1a65064435a3b6d8ae1131f609"

};

sontimeChatBot.setupBot = function(){
    var dialog = new builder.LuisDialog(sontimeChatBot.LUIS_URL);

    sontimeChatBot.botInstance.add('/', dialog);
    sontimeChatBot.botInstance.add('/promptUserName', promptUserNameDialog);
    sontimeChatBot.botInstance.add('/promptPassword', promptPasswordDialog);

    // Add intent handlers
    dialog.on('Login', onLoginIntent);
    dialog.on('Logout', onLogoutIntent);
    dialog.onDefault(onDefault);
};

sontimeChatBot.startBotServer = function(){
        // Setup Restify Server
        var server = restify.createServer();
        server.post('/api/messages', sontimeChatBot.botInstance.verifyBotFramework(), sontimeChatBot.botInstance.listen());
        server.listen(process.env.port || 3978, function () {
            console.log('%s listening to %s', server.name, server.url);
        });
};

var onLoginIntent = function (session, results) {
    console.log('Login intent: %s', util.inspect(results, false, null));


    var loginName = builder.EntityRecognizer.findEntity(results.entities, 'username');
    if (loginName){
        session.userData.login = loginName.entity;
    }
    
    var password = builder.EntityRecognizer.findEntity(results.entities, 'password');
    if (password){
        session.userData.password = password.entity;
    }

    if (noUserNameInSession(session) || noPasswordInSession(session)) {
        session.send(prompts.login_intent_without_login_or_password);
        session.beginDialog('/promptUserName');
    }else{
        session.send(prompts.login_intent_with_login_and_password, session.userData.login);
    }
}


var onLogoutIntent = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send(prompts.logout_intent);
    session.userData.login = "";
    session.userData.password = "";
}


var onDefault = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send(prompts.default_intent);
}

/**
 * Asks for login name.
 */
var promptUserNameDialog = [
        function (session, results, next) {
            if (noUserNameInSession(session)) {
                builder.Prompts.text(session, prompts.prompt_login_name);
            }else if(noPasswordInSession(session)){
                session.send(prompts.login_intent_with_login_but_without_password, session.userData.login);
                session.beginDialog("/promptPassword");
            }else{
                // we've got the username and password in session
                session.endDialog();
            }
        },
        function (session, results) {
            if (results && results.response){
                session.userData.login = results.response;
            }

            if(noPasswordInSession(session)){
                session.beginDialog("/promptPassword");
            }else{
                session.endDialog();
            }
        }];


var promptPasswordDialog = [
        function (session, next){
            if (noPasswordInSession(session)) {
                builder.Prompts.text(session, prompts.prompt_password);
            }else{
                session.send(prompts.already_know_you_password);
                session.endDialog();
            }
        },
        function (session, results, next) {
            if (results.response){
                session.userData.password= results.response;
            }
            session.endDialog();
    }
    ];


/**
 * Returns true, if there is no user name in session's userData object.
 *
 */
var noUserNameInSession = function (session){
    return !session.userData.login;
}

/**
 * Returns true, if there is no password in session's userData object.
 */
var noPasswordInSession = function (session){
    return !session.userData.password;
}


module.exports = sontimeChatBot;
