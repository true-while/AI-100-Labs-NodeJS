const request = require('request');

class PicBotTextAnalytics {
    constructor(config) {
        this.apiKey = config.endpointKey;
        this.endpoint = config.endpoint;
    }

    encodeText(text) {
        return text.trim().toLowerCase().replace('\'', '\\\'');
    }

    async detectLanguage(context) {
        if (!this.apiKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

        var uriBase = this.endpoint + 'text/analytics/v2.1/languages';

        if (context.activity === undefined || context.activity.text === undefined) { throw new Error('Text of activity must be provided'); }

        const options = {
            uri: uriBase,
            body: `{'documents': [{'id': '1', 'text': '${ this.encodeText(context.activity.text) }' }]}`,
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
}
exports.PicBotTextAnalytics = PicBotTextAnalytics;

class LangResult {
    constructor(name = '', isoname = '', score = 0) {
        this.name = name;
        this.isoname = isoname;
        this.score = score;
    }
}
