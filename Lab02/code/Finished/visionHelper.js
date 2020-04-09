'use strict';
const request = require('request');
const path = require("path");


module.exports = {

    AnalyzeImage: function (subscriptionKey, endpoint, imageURL, throttle = 0) {

        if (!subscriptionKey) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

        var uriBase = endpoint + 'vision/v2.1/analyze';

        // Request parameters.
        const params = {
            'visualFeatures': 'Categories,Description,Color',
            'details': '',
            'language': 'en'
        };

        const options = {
            uri: uriBase,
            qs: params,
            body: '{"url": ' + '"' + imageURL + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        };


        return new Promise((resolve, reject) => {

            setTimeout(() => {
                request.post(options, (error, response, body) => {
                    if (error) {
                        console.log('Error: ', error);
                        return;
                    }
                    var json = JSON.parse(body);
                    var img = new ImageInsights();
                    img.id = path.basename(imageURL);
                    img.imageURL = imageURL;
                    if (((typeof json.error != "undefined") && json.error.code == '429') ||
                        ((typeof json.statusCode != "undefined") && json.statusCode == '429')) {
                        console.log("Too much requests please wait for 1 min.");
                        resolve(); // reschedule after 1 min
                        return;
                    }
                    if (typeof json.description.captions != "undefined" && json.description.captions.length > 0)
                        img.caption = json.description.captions[0].text;
                    if (typeof json.description.tags != "undefined")
                        img.tags = json.description.tags;
                    resolve(img);
                })
            }, throttle);

        }
        );
    }
}

class ImageInsights {
    id = "";
    imageURL = "";
    caption = "";
    tags = [];
}