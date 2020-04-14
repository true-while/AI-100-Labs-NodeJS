class Intent {
    constructor(name = '', score = 0) {
        this.Name = name;
        this.Score = score;
        this.Entities = [];
    }

    getUtterance() {
        var utterance = 'nothing';
        if (this.Entities !== undefined && this.Entities.length > 0) {
            for (let i = 0; i < this.Entities.length; i++) {
                if (this.Entities[i].Value !== undefined) {
                    utterance = this.Entities[i].Value.trim();
                    break;
                }
            }
        };
        return utterance;
    }
}
class Entity {
    constructor(groupName, score, value) {
        this.GroupName = groupName;
        this.Score = score;
        this.Value = value;
    }
};

class IntentRecognition {
    constructor() {
        this.TopIntent = undefined;
        this.Intents = [];
    }
}

class RegExpRecognizerSettings {
    constructor() {
        this.MinScore = 0.0;
    }
}
module.exports.RegExpRecognizerSettings = RegExpRecognizerSettings;

class RegExLocaleMap {
    constructor(items) {
        this.map = {};
        this.Default_Key = '*';

        if (items !== undefined) {
            this.map[this.Default_Key] = items;
        }
    }

    getLocale(locale) {
        if (this.map[locale] !== undefined) {
            return this.map[locale];
        } else if (this.map.ContainsKey(this.Default_Key)) {
            return this.map[this.Default_Key];
        } else {
            return [];
        }
    }
}
module.exports.RegExLocaleMap = RegExLocaleMap;

class RegExpRecognizerMiddleware {
    constructor(settings) {
        this.settings = settings;
        this.DefaultEntityType = 'string';
        this.intents = {};
        this.TopIntent = '';
    }

    addIntent(intentName, map) {
        this.intents[intentName] = map;
    }

    findTopIntent(listOfIntents) {
        if (listOfIntents === undefined || listOfIntents.length === 0) {
            throw new Error('no intents set up');
        }
        var topIntent = listOfIntents[0];
        var topScore = topIntent.Score;

        listOfIntents.forEach(intent => {
            var currVal = intent.Score;
            if (currVal > topScore) {
                topScore = currVal;
                topIntent = intent;
            }
        });

        return topIntent;
    }

    recognize(text, expression, entityTypes, minScore) {
        // Note: Not throwing here, as users enter whitespace all the time.
        if (text === undefined || text === '') {
            return undefined;
        }
        if (minScore < 0 || minScore > 1.0) {
            throw new Error(`RegExpRecognizer: a minScore of '${ minScore }' is out of range for expression '${ expression }'`);
        }

        var match = expression.exec(text);

        if (match != null) {
            var m = match[1];
            if (m === undefined) m = match[0];
            var coverage = text.length / text.length;
            var score = minScore + ((1.0 - minScore) * coverage);

            var intent = new Intent(entityTypes, score);
            var newEntity = new Entity(expression, score, match.pop());
            intent.Entities.push(newEntity);

            return intent;
        }
    }

    recognizeActivity(context) {
        var recognized = [];
        var utterance = context.activity.text.toLocaleLowerCase().trim();
        var minScore = this.settings.MinScore;

        if (this.intents !== undefined && Object.keys(this.intents).length > 0) {
            Object.keys(this.intents).forEach((key) => {
                var top = this.recognize(utterance, this.intents[key], key, minScore);
                if (top !== undefined) {
                    recognized.push(top);
                }
            });
        }
        return recognized;
    };

    async onTurn(context, next) {
        if (!context) {
            throw new Error('Context is returning null');
        };

        if (context.activity.type === 'message') {
            var intents = await this.recognizeActivity(context);
            var result = new IntentRecognition();
            if (intents.length !== 0) {
                result.Intents = intents;
                var topIntent = this.findTopIntent(intents);
                if (topIntent.Score > 0.0) {
                    result.TopIntent = topIntent;
                }
            }
            context.turnState.set('recognize', result);
        }
        await context.onSendActivities(async (context, activities, nextSend) => {
            for (const activity of activities) {
                await activity;
            }
            return await nextSend();
        });

        await next();
    }
}
module.exports.RegExpRecognizerMiddleware = RegExpRecognizerMiddleware;
