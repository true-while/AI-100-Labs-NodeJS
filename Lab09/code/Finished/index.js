const dotenv = require('dotenv');
const path = require('path');
const { DirectLine } = require('./directLine');
const readline = require('readline');

// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const line = new DirectLine(process.env.DirectLineKey);

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function printActivity(msg) {
    console.log('Bot said:');
    console.log('______________________________');
    await msg.activities.forEach(activity => {
        console.log(activity.text);
    });
    console.log('______________________________');
}

async function main() {
    this.msg = '';

    await line.Init();
    console.log('Starting new conversation');
    console.log(`Conversation ID = ${ line.conversationId }`);

    while (this.yourmsg !== 'exit') {
        this.yourmsg = await askQuestion('What is your message to bot?: ');
        await line.sentMessage(this.yourmsg)
            .then((watermark) => line.getMessage(watermark))
            .then(msg => printActivity(msg));
    }
}

main();
