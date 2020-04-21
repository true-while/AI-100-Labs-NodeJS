# Completed code

This bot has been created as result of the previous exercises.

## Prerequisites
- [Node.js](https://nodejs.org) version 10.14 or higher
    ```bash
    # determine node version
    node --version
    ```

# To run the bot locally

1. Open VS code. 

1. Chose `open folder` and select current folder.

![Debug Console output](../images/help_test_openfolder.png).

1. Open new terminal from `Terminal` menu. Run following command in the folder you have a `index.js` to install modules

    ```bash
    npm install
    ```

1. Open file `.env` and update `MicrosoftAppI` and `MicrosoftAppPassword`. You should already pick those values from your Azure Portal for bot you build in first exercise.

1. Select `Run` from  VS Code menu, then select `Start Debugging`. Make sure your debugger attached. It should show output on `debugger console`

![Debug Console output](../images/help_test_debugconsole.png).

1. Connect your Bot Emulator to locally hosted bot. It usually hosted on `http://localhost:3978/api/messages`. You must provide the same optional values from file `.env`.

![Connect by Bot Emulator](../images/help_test_botemulator.png).

1. Bot should proactively send you message 'Hello and welcome!' 

![Test by Emulator](../images/help_test_greeting.png).

1. Continue testing your bot according main scenario.


# Links

## Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.5.2 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

## Connect to the bot using Bot Framework Emulator
- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

## Deploy the bot to Azure

To learn more about deploying a bot to Azure, see [Deploy your bot to Azure](https://aka.ms/azuredeployment) for a complete list of deployment instructions.

## Further reading
- [Bot Framework Documentation](https://docs.botframework.com)
- [Bot Basics](https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Azure Bot Service Introduction](https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Azure Bot Service Documentation](https://docs.microsoft.com/azure/bot-service/?view=azure-bot-service-4.0)
- [Deploy your bot to Azure](https://aka.ms/azuredeployment)
- [Azure CLI](https://docs.microsoft.com/cli/azure/?view=azure-cli-latest)
- [Azure Portal](https://portal.azure.com)
- [Activity processing](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0)
- [Language Understanding using LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/)
- [Channels and Bot Connector Service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [Restify](https://www.npmjs.com/package/restify)
- [dotenv](https://www.npmjs.com/package/dotenv)
