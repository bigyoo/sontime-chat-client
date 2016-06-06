var restify = require('restify');
var builder = require('botbuilder');
var util = require('util');

// URL of LUIS model published as a HTTP service
var LUIS_URL = "https://api.projectoxford.ai/luis/v1/application?id=1bb1085a-f7b1-4f91-9e37-e9a8f10dd7e3&subscription-key=c35fcb1a65064435a3b6d8ae1131f609";


module.exports = {

    main: function () {
        // Create bot and add dialogs
        var bot = new builder.BotConnectorBot({appId: 'YourAppId', appSecret: 'YourAppSecret'});

        var dialog = new builder.LuisDialog(LUIS_URL);
        bot.add('/', dialog);
        bot.add('/promptUserName', promptUserNameDialog);
        bot.add('/promptPassword', promptPasswordDialog);

        // Add intent handlers
        dialog.on('Login', onLoginIntent);
        dialog.on('Logout', onLogoutIntent);
        dialog.onDefault(onDefault);


        // Setup Restify Server
        var server = restify.createServer();
        server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
        server.listen(process.env.port || 3978, function () {
            console.log('%s listening to %s', server.name, server.url);
        });

    }

}


var onLoginIntent = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));


    var loginName = builder.EntityRecognizer.findEntity(results.entities, 'username');
    if (loginName){
        session.userData.login = loginName.entity;
    }

    if (noUserNameInSession(session) || noPasswordInSession(session)) {
        session.send("I think you'd like to login to Sontime, but I don't know your full credentials.");
        session.beginDialog('/promptUserName');
    }else{
        session.send("I think you'd like to login to Sontime, and I know your user name (%s.) and your password too.", session.userData.login);
    }
}


var onLogoutIntent = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send("So you'd like to logout from Sontime.");
    session.userData.login = "";
    session.userData.password = "";
}


var onDefault = function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send("Sorry but I don't understand. Doh! I'm just a bot actually. :)");
}

// asks for login name
var promptUserNameDialog = [
        function (session, results, next) {
            if (noUserNameInSession(session)) {
                builder.Prompts.text(session, "What's you login name?");
            }else if(noPasswordInSession(session)){
                // console.log('login: %s', util.inspect(session.userData.login, false, null));
                session.send("I already know your name: %s. But I don't know your password.", session.userData.login);
                session.beginDialog("/promptPassword");
                // next();
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
                builder.Prompts.text(session, "What's you password?");
            }else{
                session.send("I already know your password");
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


// returns true, if there is no user name in session's userData object.
var noUserNameInSession = function (session){
    return !session.userData.login;
}

// returns true, if there is no password in session's userData object.
var noPasswordInSession = function (session){
    return !session.userData.password;
}