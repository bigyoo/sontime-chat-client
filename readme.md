# Sontime Chat Bot

## Vision

To create an "intelligent" bot in order to interact with Sontime via Slack or Skype chat and manage your timesheet by typing free text messages. In long term it would be great to create a Sontime client which understands oral speech.

![Sontime Chat Bot Vision Overview](_docs/Sontime-Chat-Bot-Vision.png "Sontime Chat Bot Vision")

## Technology Overview

This application is build on the following technologies:
- Node.js
- Microsoft BOT Framework
 - Overview: https://dev.botframework.com/
 - Bot Builder for Node.js: http://docs.botframework.com/builder/node/overview/
 - Bot Emulator for testing: http://docs.botframework.com/connector/tools/bot-framework-emulator/
- Microsoft Language Understanding Intelligent Service (LUIS)
 - Overview: https://www.luis.ai/
 - Short video tutorial: https://www.luis.ai/Help
- Microsoft Cognitive Services
  - Overview: https://www.microsoft.com/cognitive-services/en-us/documentation
  - Speech recognition API: https://www.microsoft.com/cognitive-services/en-us/speech-api/documentation/overview

## How to run it

```
npm install
node app/app.js
```
 

## How to test

```
npm install
npm test
```
You should get something like this:
```
$ npm test

> sontime-chat-client@1.0.0 test /home/barnabas/Projects/sontime-chat-client
> jasmine-node tests/*.spec.js

..

Finished in 0.032 seconds
2 tests, 9 assertions, 0 failures, 0 skipped
```
