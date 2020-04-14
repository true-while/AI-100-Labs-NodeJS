// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { PictureState, DialogState } = require('./pictureState');
const { ActivityHandler } = require('botbuilder');

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

class EchoBot extends ActivityHandler {
    constructor(conversationState, userState, dialogSet) {
        super();

        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);

        // The state management objects for the conversation and user state.
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogSet = dialogSet;
        this.dialogState = this.conversationState.createProperty('DialogState');
        this.picBotState = this.conversationState.createProperty('PicBotState');

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // get the state objects
            const conversationState = await this.conversationDataAccessor.get(context, { DialogState: new DialogState(), PicBotState: new PictureState() });
            const userState = await this.userProfileAccessor.get(context, { count: 0 });

            await context.sendActivity(`You said '${ context.activity.text }' conversation-state: ${ conversationState.PicBotState.greeted } user-state: ${ userState.count }`);

            await this.dialogSet.run(context, this.dialogState);

            conversationState.PicBotState.messageCount++;
            userState.count++;

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.EchoBot = EchoBot;
