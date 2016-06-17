'use strict';

const util = require('util');
var builder = require('botbuilder');
var restify = require('restify');
var prompts = require('./prompts');


var sontimeChatBot = {
    botInstance: new builder.BotConnectorBot({appId: 'YourAppId', appSecret: 'YourAppSecret'}),
    LUIS_URL: "https://api.projectoxford.ai/luis/v1/application?id=1bb1085a-f7b1-4f91-9e37-e9a8f10dd7e3&subscription-key=c35fcb1a65064435a3b6d8ae1131f609"

};

var userContext = {
    login: null,
    password: null
}

// --------------------------------------------------------------------
// ~ Bot configuration
// --------------------------------------------------------------------

sontimeChatBot.startBotServer = function(){
        // Setup Restify Server
        var server = restify.createServer();
        server.post('/api/messages', sontimeChatBot.botInstance.verifyBotFramework(), sontimeChatBot.botInstance.listen());
        server.listen(process.env.port || 3978, function () {
            console.log('%s listening to %s', server.name, server.url);
        });
};

sontimeChatBot.setupBot = function(){
    var dialog = new builder.LuisDialog(sontimeChatBot.LUIS_URL);

    sontimeChatBot.botInstance.add('/', dialog);
    sontimeChatBot.botInstance.add('/loginDialog', loginDialogChain);
    sontimeChatBot.botInstance.add('/logoutDialog', logoutDialogChain);

    // Add intent handlers
    dialog.on('Login', onLoginIntent);
    dialog.on('Logout', onLogoutIntent);
    dialog.onDefault(onDefault);
};

// --------------------------------------------------------------------
// ~ Intent handlers
// --------------------------------------------------------------------

var onLoginIntent = function (session, results) {
    console.log('Login intent: %s', util.inspect(results, false, null));

    // if the intent contains a login name, it will be put into the user context
    var loginName = builder.EntityRecognizer.findEntity(results.entities, 'username');
    if (loginName){
        userContext.login = loginName.entity;
    }

    // if the intent contains a password, it will be put into the user context
    var password = builder.EntityRecognizer.findEntity(results.entities, 'password');
    if (password){
        userContext.password = password.entity;
    }

    // starts a new login dialog
    session.beginDialog('/loginDialog');
}


var onLogoutIntent = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));

    // FIXME: this dialog stucks into an infinit loop
    session.beginDialog('/logoutDialog');

}


var onDefault = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send(prompts.default_intent);
}

// --------------------------------------------------------------------
// ~ Dialog chains
// --------------------------------------------------------------------

var logoutDialogChain = [
    function (session, results, next){
        session.send(prompts.logout_intent);
        next();
    },
    function(session, results, next){
        userContext.login = null;
        userContext.password = null;
        next();
    },
    function (session, results, next){
        session.endDialog(results);
    },
]

var loginDialogChain = [
    function (session, results, next) {
        // prompts for login name if there is
        if (noUserNameInContext()) {
            builder.Prompts.text(session, prompts.prompt_login_name);
        }else{
            next();
        }
    },
    function (session, results, next) {
        // stores the login name
        if (results && results.response){
            userContext.login = results.response;
        }
        next();
    },
    function (session, results, next){
        if (noPasswordInContext()) {
            builder.Prompts.text(session, prompts.prompt_password);
        }else{
            next();
        }
    },
    function (session, results, next) {
        if (results.response){
            userContext.password= results.response;
        }
        next();
    },
    function (session) {
        session.send(prompts.login_intent_with_login_and_password + " %s", userContext.login, userContext.password);
        session.endDialog();
    }
];


module.exports = sontimeChatBot;

// -------------------------------------------------------------------------
// ~ Private functions
// -------------------------------------------------------------------------

/**
 * Returns true, if there is no user name in the user context object.
 *
 */
var noUserNameInContext = function (){
    return !userContext.login;
}

/**
 * Returns true, if there is no password in the user context object.
 */
var noPasswordInContext = function (){
    return !userContext.password;
}

// // TODO sontime need to be mocked in bot tests
// var sontime = require('../sontime');

function playingWithSontime() {

    //
    //     // // TODO: here i'm just playing with sontime API
    //     // sontime.getUser(userContext.login, userContext.password)
    //     //     .then(function (sontimeUser) {
    //     //         session.send(util.format(prompts.login_success, userContext.login));
    //     //         return sontimeUser.getResource('v2/projects/100');
    //     //     }).then(function (project) {
    //     //         console.log(project);
    //     //         session.send(util.format('Your project is %s, the customer is %s ',project.name, project.company.name) );
    //     //     });
    // }

}
