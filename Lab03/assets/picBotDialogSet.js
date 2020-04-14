const {
    ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const { ReplyWithSearchConfirmation, ReplyWithGreeting, ReplyWithHelp, ReplyWithShareConfirmation, ReplyWithOrderConfirmation, ReplyWithConfused } = require('./responses');

const MAIN_WATERFALLSTEPS = 'main_waterfallsteps';
const SEARCH_WATERFALLSTEPS = 'search_waterfallstep';
const SEARCH_PROMPT = 'searchPrompt';
const CONVERSATION_DATA_PROPERTY = 'conversationData';

class PicBotDialogSet extends ComponentDialog {
    constructor(conversationState) {
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
    }

    async searching(step) {
        return await step.endDialog();
    }

    async greeting(step) {
        return ReplyWithGreeting(step.context);
    }

    async mainMenu(step) {
        return await step.endDialog();
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
