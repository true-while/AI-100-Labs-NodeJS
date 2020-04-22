// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class PicBotLuisRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            this.recognizer = new LuisRecognizer(config, {}, true);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getEntities(result) {
        let entities = '';
        if (result.entities !== undefined && result.entities.facet !== undefined && result.entities.facet.length > 0) {
            entities = result.entities.facet.join(', ');
        }
        return entities;
    }

    getTopIntent(result) {
        var intent = 'None';
        var score = 0;
        if (result.luisResult !== undefined && result.luisResult.topScoringIntent !== undefined) {
            intent = result.luisResult.topScoringIntent.intent;
            score = result.luisResult.topScoringIntent.score;
        }

        return {
            intent: intent,
            score: score
        };
    }
}

exports.PicBotLuisRecognizer = PicBotLuisRecognizer;
