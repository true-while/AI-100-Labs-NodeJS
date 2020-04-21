const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

const { ReplyWithLuisScore, ReplyWithSearchConfirmation, ReplyWithGreeting, ReplyWithHelp, ReplyWithShareConfirmation, ReplyWithOrderConfirmation, ReplyWithConfused } = require('./responses');

const MAIN_WATERFALLSTEPS = 'main_waterfallsteps';
const SEARCH_WATERFALLSTEPS = 'search_waterfallstep';
const SEARCH_PROMPT = 'searchPrompt';
const CONVERSATION_DATA_PROPERTY = 'conversationData';

class PicBotDialogSet extends ComponentDialog {
    constructor(conversationState, luisRecognizer) {
        super('PictureBotDialogs');

        this.conversationState = conversationState;
        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);

        this.addDialog(new TextPrompt(SEARCH_PROMPT));

        this.addDialog(new WaterfallDialog(MAIN_WATERFALLSTEPS, [
            this.greeting.bind(this),
            this.mainMenu.bind(this)
        ]));

        this.addDialog(new WaterfallDialog(SEARCH_WATERFALLSTEPS, [
            this.searching.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALLSTEPS;
        this.luisRecognizer = luisRecognizer;
    }

    async searching(stepContext) {
        var recognizedIntents = stepContext.context.turnState.get('recognize');
        await ReplyWithSearchConfirmation(stepContext.context, recognizedIntents.TopIntent.getUtterance());
        return await stepContext.endDialog();
    }

    async greeting(stepContext) {
        // Get the state for the current step in the conversation
        var state = await this.conversationDataAccessor.get(stepContext.context);
        var picState = state.PicBotState;

        // If we haven't greeted the user
        if (picState.greeted === 'not greeted') {
            // Greet the user
            await ReplyWithGreeting(stepContext.context);
            // Update the GreetedState to greeted
            picState.greeted = 'greeted';
            // Save the new greeted state into the conversation state
            // This is to ensure in future turns we do not greet the user again
            await this.conversationState.saveChanges(stepContext.context, false);
            // Ask the user what they want to do next
            await ReplyWithHelp(stepContext.context);
            // Since we aren't explicitly prompting the user in this step, we'll end the dialog
            // When the user replies, since state is maintained, the else clause will move them
            // to the next waterfall step
            return await stepContext.endDialog();
        } else {
            // We've already greeted the user
            // Move to the next waterfall step, which is MainMenuAsync
            return await stepContext.next();
        }
    }

    async askLuis(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            stepContext.sendActivity(messageText);
            return await stepContext.next();
        }

        var luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        var topIntent = this.luisRecognizer.getTopIntent(luisResult);
        switch (topIntent.intent) {
        case 'None': {
            await ReplyWithConfused(stepContext.context);
            await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
            break;
        }
        case 'Greeting': {
            await ReplyWithGreeting(stepContext.context);
            await ReplyWithHelp(stepContext.context);
            await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
            break;
        }
        case 'OrderPic': {
            await ReplyWithOrderConfirmation(stepContext.context);
            await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
            break;
        }
        case 'SharePic': {
            await ReplyWithShareConfirmation(stepContext.context);
            await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
            break;
        }
        case 'SearchPics': {
            var ents = this.luisRecognizer.getEntities(luisResult);
            await ReplyWithSearchConfirmation(stepContext.context, ents);
            await ReplyWithLuisScore(stepContext.context, topIntent.intent, topIntent.score);
            break;
        }
        default: {
            await ReplyWithConfused(stepContext.context);
        }
        }
    }

    async mainMenu(stepContext) {
        // Check if we are currently processing a user's search
        // If Regex picks up on anything, store it
        var recognizedIntents = stepContext.context.turnState.get('recognize');
        // Based on the recognized intent, direct the conversation
        if (recognizedIntents.TopIntent !== undefined) {
            switch (recognizedIntents.TopIntent.Name) {
            case 'search':
                // switch to the search dialog
                return stepContext.beginDialog(SEARCH_WATERFALLSTEPS);
            case 'share':
                // respond that you're sharing the photo
                await ReplyWithShareConfirmation(stepContext.context);
                return stepContext.endDialog();
            case 'order':
                // respond that you're ordering
                await ReplyWithOrderConfirmation(stepContext.context);
                return stepContext.endDialog();
            case 'help':
                // show help
                await ReplyWithHelp(stepContext.context);
                return stepContext.endDialog();
            default:
                await ReplyWithConfused(stepContext.context);
                return stepContext.endDialog();
            }
        } else {
            await this.askLuis(stepContext);
            return stepContext.endDialog();
        }
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
}

exports.PicBotDialogSet = PicBotDialogSet;
