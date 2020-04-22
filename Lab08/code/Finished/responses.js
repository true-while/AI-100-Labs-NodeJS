module.exports = {

    ReplyWithGreeting: function(context) {
        // Add a greeting
        return context.sendActivity('Hello human!');
    },

    ReplyWithHelp: function(context) {
        return context.sendActivity('I can search for pictures, share pictures and order prints of pictures.');
    },

    ReplyWithResumeTopic: function(context) {
        return context.sendActivity('What can I do for you?');
    },

    ReplyWithConfused: function(context) {
        // Add a response for the user if Regex or LUIS doesn't know
        // What the user is trying to communicate
        return context.sendActivity('I can not help you with that!');
    },

    ReplyWithLuisScore: function(context, key, score, lang, sentiment) {
        var smile = (sentiment > 0.5) ? ':)' : (sentiment < 0.5) ? ':(' : ':|';
        return context.sendActivity(`Intent: ${ key } (${ score }); lang: ${ lang.name } (${ lang.score }); sentiment: ${ smile }`);
    },

    ReplyWithShareConfirmation: function(context) {
        return context.sendActivity('Posting your picture(s) on twitter...');
    },

    ReplyWithOrderConfirmation: function(context) {
        return context.sendActivity('Ordering standard prints of your picture(s)...');
    },

    ReplyWithSearchConfirmation: function(context, utterance) {
        return context.sendActivity(`Ok, searching for pictures ${ utterance }`);
    },

    ReplyWithNoResults: function(context, utterance) {
        return context.sendActivity(`There were no results found for '${ utterance }'`);
    }
};
