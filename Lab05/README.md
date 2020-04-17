# Lab 5: Creating a Customized QnA Maker Bot

## Introduction

In this lab we will explore the QnA Maker for creating bots that connect to a pre-trained knowledge base.  Using QnAMaker, you can upload documents or point to web pages and have it pre-populate a knowledge base that can feed a simple bot for common uses such as frequently asked questions.

### Time to complete: 30 min

## Lab 5.2: Create a KnowledgeBase

1. Open the [QnA Maker site](https://qnamaker.ai)

1. In the top right, select **Sign in**.  Login using the Azure credentials for your new QnA Maker resource

1. In the top navigation area, select **Create a knowledge base**

1. From **STEP 1** click on the button **create new QnA service** you will be redirected to the azure portal

1. Type a name

1. Select the **S0** tier for the resource pricing tier.  We aren't using the free tier because we will upload files that are larger than 1MB later.

1. Select your resource group

1. For the search pricing tier, select the **F** tier

1. Enter an app name, it must be unique

1. Select **Create**.  This will create the following resources in your resource group:

- App Service Plan
- App Service
- Application Insights
- Search Service
- Cognitive Service instance of type QnAMaker

1. You have to wait until provisioning finished. Return back to the QnA portal to your KB.

1. On **STEP 2** click on "Refresh" button.

1. Select your Azure AD and Subscription tied to your QnA Maker resource, then select your newly created QnA Maker resource and your target language.


1. On **STEP 3**  for the name, type **Microsoft FAQs**

1. For the file, select **Add file**, browse to the **code/surface-pro-4-user-guide-EN.pdf** file

1. For the file, select **Add file**, browse to the **code/Manage Azure Blob Storage** file

> **Note** You can find out more about the supported file types and data sources [here](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/concepts/data-sources-supported)

1. For the **Chit-chat**, select **Witty**

1. Select **Create your KB**

> **NOTE** This can take a few minutes.

## Lab 5.2: Publish and Test your Knowledge base

1. Review the knowledge base QnA pairs, you should see ~200+ different pairs based on the two documents we fed it

1. In the top menu, select **PUBLISH**.  

1. On the publish page, select **Publish**.  Once the service is published, select the **Create Bot** button on the success page

1. If prompted, login as the account tied to your lab resource group.

1. On the bot service creation page, fix any naming errors, then select **Create**.

> **Note**  Recent change in Azure requires dashes ("-") be removed from some resource names

1. Once the bot resource is created, navigate to the new **Web App Bot**, then select **Test in Web Chat**

1. Ask the bot any questions related to a Surface Pro 4 or managing Azure Blog Storage:

- How long does it take to charge the battery?
- What is a blob?

1. Ask it some questions it doesn't know, such as:

- How do I bowl a strike?

## Lab 5.4: Download the Bot Source code

1. Under **Bot management**, select the **Build** tab

1. Select **Download Bot source code**, when prompted select **Yes**.  

1. Azure will build your source code, when complete, select **Download Bot source code**, if prompted, select **Yes**

1. Extract the zip file to your local computer

1. Open the .sln solution file with Visual Studio 2019

1. Open the **index.js** file, you will notice nothing special has been added here: 

```js
const qnaService = new QnAMaker({
    knowledgeBaseId: process.env.QnAKnowledgebaseId,
    endpointKey: process.env.QnAAuthKey,
    host: endpointHostName
});
// Create the main dialog.
const dialog = new RootDialog(qnaService);
// Create the bot's main handler.
const bot = new QnABot(conversationState, userState, dialog);
```

1. Open the **Bots/qnaBot.js** file and review the code that was generated for this file

[!NOTE] The previous steps for reviewing the generated code are correct for the solution that was downloaded during the authoring of this lab.  The solution files may change from time to time based on updates to the frameworks and SDKs so the solution files may differ.  The key aspect here is just have you review the code that is automatically generated from the tool.

## Going Further

What would you do to integrate the QnAMaker code into your picture bot?

## Resources

- [What is the QnA Maker service?](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/overview/overview)

## Next Steps

- [Lab 06-01: Implement LUIS](../Lab06/README.md)
