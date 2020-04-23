const request = require('request');
const tokenUrl = 'https://directline.botframework.com/v3/directline/tokens/generate';
const converUrl = 'https://directline.botframework.com/v3/directline/conversations';
const sendMsgUrl = 'https://directline.botframework.com/v3/directline/conversations/[id]/activities';

const userId = 'DLUser';
const userName = 'User1';

class DirectLine {
    constructor(key, token, conversationId) {
        this.key = key;
        this.token = token;
        this.conversationId = conversationId;
    }

    async Init() {
        if (this.key === undefined && this.token === undefined) { throw Error('Key or Token must be provided in constructor'); }
        this.token = await this.getToken();
        if (this.conversationId === undefined) {
            this.conversationId = await this.getConversationId();
        }
    }

    sentMessage(msg = 'hello') {
        if (this.key === undefined && this.token === undefined) { throw Error('Key or Token must be provided in constructor'); }
        if (this.conversationId === undefined) { throw Error('Conversation ID must be provided to send message'); }

        const options = {
            post: true,
            https: true,
            uri: sendMsgUrl.replace('[id]', this.conversationId),
            body: `{
                "type": "message",
                "from": {
                    "id": "${ userId }",
                    "name": "${ userName }"
                },
                "text": "${ msg }"
            }`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ this.key === undefined ? this.token : this.key }`
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                var json = JSON.parse(body);
                resolve(json.id.split('|').pop());
            });
        });
    }

    getMessage(watermark) {
        if (this.key === undefined && this.token === undefined) { throw Error('Key or Token must be provided in constructor'); }
        if (this.conversationId === undefined) { throw Error('Conversation ID must be provided to send message'); }

        const options = {
            post: true,
            https: true,
            uri: sendMsgUrl.replace('[id]', this.conversationId) + `?watermark=${ watermark }`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ this.key }`
            }
        };

        return new Promise((resolve, reject) => {
            request.get(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                resolve(JSON.parse(body));
            });
        });
    }

    getConversationId() {
        const options = {
            uri: converUrl,
            headers: {
                Authorization: `Bearer ${ this.key === undefined ? this.token : this.key }`
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                var json = JSON.parse(body);
                resolve(json.conversationId);
            });
        });
    }

    getToken() {
        const options = {
            uri: tokenUrl,
            headers: {
                Authorization: `Bearer ${ this.key }`
            }
        };

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    console.log('Error: ', error);
                    return;
                }
                var json = JSON.parse(body);
                resolve(json.token);
            });
        });
    }
}
exports.DirectLine = DirectLine;
