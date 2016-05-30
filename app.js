var restify = require('restify');
var builder = require('botbuilder');
var util = require('util');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });

// Create LUIS Dialog that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=edfc7f9a-c512-40b7-a9ec-215a6c75b199&subscription-key=c35fcb1a65064435a3b6d8ae1131f609&q=';
var dialog = new builder.LuisDialog(model);
bot.add('/', dialog);


// Add intent handlers
dialog.on('OrganizeMeeting',
  function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send('Set a meeting at ..... ');
});

dialog.on('CancelMeeting',
  function (session, results) {
    console.log('result: %s', util.inspect(results, false, null));
    session.send('Cancel your meeting at ..... ');
});

// dialog.on('builtin.intent.alarm.delete_alarm', builder.DialogAction.send('Deleting Alarm'));
dialog.onDefault(

  function (session, results) {
      console.log('result: %s', util.inspect(results, false, null));
      session.send("I don't understand.");
    }
  //builder.DialogAction.send("I'm sorry I didn't understand. I can only organize meetings.")

);



/*
/

bot.add('/', new builder.CommandDialog()
    .matches('^set name', builder.DialogAction.beginDialog('/profile'))
    .matches('^quit', builder.DialogAction.endDialog())
    .onDefault(function (session) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            session.send('Hello %s!', session.userData.name);
        }
    }));
bot.add('/profile',  [
    function (session) {
        if (session.userData.name) {
            builder.Prompts.text(session, 'What would you like to change it to?');
        } else {
            builder.Prompts.text(session, 'Hi! What is your name?');
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);
*/

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
