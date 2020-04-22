# Lab 8 - Detect Language

In this lab we are going to integrate language detection ability of cognitive services into our bot.

## Lab 8.1: Retrieve your Cognitive Services url and keys

1. Open the [Azure Portal](https://portal.azure.com)

1. Navigate to your resource group, select the cognitive services resource that is generic (aka, it contains all end points).

1. Under **RESOURCE MANAGEMENT**, select the **Quick Start** tab and record the url and the key for the cognitive services resource

## Lab 8.2: Add language support to your bot

1. If not already open, open your **PictureBot** folder. If you d

> **NOTE** You can also start with the **{GitHubPath}/Lab08/code/Starter/** folder if you did not start from Lab 1.

> Be sure to replace all the app settings values in **.evn** file

1. Open terminal and run following command

```bash
npm install request
```

1. Open the **index.js** file, add the following using statements:

```js
const dialogSet = new PicBotDialogSet(conversationState, luisRecognizer, textAnalytics);
```

replace with:

```js
const textAnalyticsConfig = {
    endpointKey: process.env.TextAnalyticsKey,
    endpoint: process.env.TextAnalyticsHostName
};
const textAnalytics = new PicBotTextAnalytics(textAnalyticsConfig);

// Create the main dialog.
const dialogSet = new PicBotDialogSet(conversationState, luisRecognizer, textAnalytics);
```

1. Modify the **.env** to include the following properties, be sure to fill them in with your text analytic instance values. Refer to the previous labs to find out where the values located:

```ini
TextAnalyticsKey=""
TextAnalyticsHostName=""
```

1. Add the following reference to the top of the file.

```js
const { PicBotTextAnalytics } = require('./picBotTextAnalytics');
```

1. Now you need to create new file `picBotTextAnalytics.js` and provide following class with constructor. 

```js
const request = require('request');

class PicBotTextAnalytics {
    constructor(config) {
        this.apiKey = config.endpointKey;
        this.endpoint = config.endpoint;
    }

    //provide the code of the class.
}
exports.PicBotTextAnalytics = PicBotTextAnalytics;

class LangResult {
    constructor(name = '', isoname = '', score = 0) {
        this.name = name;
        this.isoname = isoname;
        this.score = score;
    }
}
```

1. Add the following code to the **PicBotTextAnalytics** class. This code will call the text analytics service and parse the returned result.

```js
async detectLanguage(context) {
        if (!this.apiKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

        var uriBase = this.endpoint + 'text/analytics/v2.1/languages';

        if (context.activity === undefined || context.activity.text === undefined) { throw new Error('Text of activity must be provided'); }

        const options = {
            uri: uriBase,
            body: `{'documents': [{'id': '1', 'text': '${ context.activity.text }' }]}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                var json = JSON.parse(body);
                var langResult = new LangResult();
                if (json.documents !== undefined && json.documents.length > 0) {
                    var doc = json.documents[0];
                    if (doc.detectedLanguages !== undefined && doc.detectedLanguages.length > 0) {
                        var sorted = doc.detectedLanguages.sort((a, b) => (a.score > b.score) ? 1 : -1);
                        langResult.name = sorted[0].name;
                        langResult.isoname = sorted[0].iso6391Name;
                        langResult.score = sorted[0].score;
                    }
                }
                resolve(langResult);
            });
        });
    }
```

>**Note** You can refer to [Detect language](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/how-tos/text-analytics-how-to-language-detection) documentation to observer the response format.  

1. Open the **picBotDialogSet.js** file, add located the following using statements:

```js
constructor(conversationState, luisRecognizer)
```

replace with following:

```js
constructor(conversationState, luisRecognizer, textAnalytics) 
```

Then add the field below in the constructor

```js
this.textAnalytics = textAnalytics;
```

1. Now we need update the code of the function `askLuis`. Locate `topIntent`  initialization and add following code below: 

```js
var textResult = await this.textAnalytics.detectLanguage(stepContext.context);
```

1. Now you can update all calls to function `ReplyWithLuisScore`

```js
await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
```
with following:

```js
await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score, textResult);
```

1. Finlay update `responses.js` file and change `ReplyWithLuisScore` functions implementation:

```js
    ReplyWithLuisScore: function(context, key, score, lang) {
        return context.sendActivity(`Intent: ${ key } (${ score }), lang: ${ lang.name } (${ lang.score }).`);
    },
```

1. Press **F5** to start your bot

1. Using the Bot Emulator, send in a few phrases and see what happens:

- Como Estes?
- Bon Jour!
- Привет
- Hello

![Test Results](../../images/lab08-ex1-result.png)

>Get stuck or broken? You can find the solution for the lab up until this point under [code/Ex02](./code/Ex02). You will need to insert the keys for your Azure Bot Service in the `.env` file. We recommend using this code as a reference, not as a solution to run, but if you choose to run it, be sure to add the necessary keys (in this section, there shouldn't be any).

## Lab 8.3: Add sentiment analysis to your bot

1. In current exercise we will add support of sentiment recognition and output result in the same way like we did before.

1. Lets ope file `picBotTextAnalytics.js` and add new function to the class to clean up a text for analytics.

```js
    encodeText(text) {
        return text.trim().toLowerCase().replace('\'', '\\\'');
    }
```

1. Also add add new function `detectSentiment` to the same class.

```js
async detectSentiment(context, lang) {
        if (!this.apiKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

        var uriBase = this.endpoint + 'text/analytics/v2.1/sentiment';

        if (context.activity === undefined || context.activity.text === undefined) { throw new Error('Text of activity must be provided'); }

        const options = {
            uri: uriBase,
            body: `{'documents': [{'id': '1', 'language': '${ lang }', 'text': '${ this.encodeText(context.activity.text) }' }]}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.apiKey
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                var json = JSON.parse(body);
                var score = 0.5;
                if (json.documents !== undefined && json.documents.length > 0) {
                    score = json.documents[0].score;
                }
                resolve(score);
            });
        });
    }
```

1. You also can add call to the encode function `this.encodeText(context.activity.text)` to the function `detectLanguage`

1. Now we can add call to the `detectSentiment` in `picBotDialogSet.js` file. Add the following line after call to `detectLanguage`

```js
 var sentiment = await this.textAnalytics.detectSentiment(stepContext.context, textResult.isoname);
 ```

1. We also need to update calls to the `ReplyWithLuisScore` like following: 

```js
    await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score, textResult);
```
with:

```js
     await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score, textResult, sentiment);
```

1. Finlay update `responses.js` file with following implementation of function `ReplyWithLuisScore`.

```js
    ReplyWithLuisScore: function(context, key, score, lang, sentiment) {
        var smile = (sentiment > 0.5) ? ':)' : (sentiment < 0.5) ? ':(' : ':|';
        return context.sendActivity(`Intent: ${ key } (${ score }); lang: ${ lang.name } (${ lang.score }); sentiment: ${ smile }`);
    },
```
1. Press **F5** to start your bot

1. Using the Bot Emulator, send in a few phrases and see what happens:

- This images was awesome.
- This image is not good!

![Test Results](../../images/lab08-final-result.png)

>Get stuck or broken? You can find the solution for the lab up until this point under [code/Finished](./code/Finished). You will need to insert the keys for your Azure Bot Service in the `.env` file. We recommend using this code as a reference, not as a solution to run, but if you choose to run it, be sure to add the necessary keys (in this section, there shouldn't be any).


## Going further

Since we have already introduced you to LUIS in previous labs, think about what changes you may need to make to support multiple languages using LUIS.  Some helpful articles:

- [Language and region support for LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-language-support)

## Resources

- [Example: Detect language with Text Analytics](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/how-tos/text-analytics-how-to-language-detection)
- [Quickstart: Text analytics client library for .NET](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/quickstarts/csharp)

## Next Steps

- [Lab 09-01: Test Bot DirectLine](../Lab9/README.md)