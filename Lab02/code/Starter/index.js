'use strict';
const fs = require('fs');
const path = require('path')
const delay = require('delay');

var VisionHelper = require('./visionHelper');
var BlobHelper = require('./blobHelper');
var ImgHelper = require('./imgHelper');
var CosmosDBHelper = require('./cosmosDBHelper');

const subscriptionKey = "your vision cognitive service key"; 
const endpoint = "your vision cognitive service endpoint url FQDN with https"
const BlobConnectionString = "Connection string form your Storage Account"
const BlobContainerName = "lowercase and number name of container";
const CosmosDBAccessKey = "your cosmos db key";
const CosmosDBEndpointUri = "your cosmos db endpoint url FQDN with https";
const CosmosDBDatabaseName = "name of the DB";
const CosmosDBCollectionName = "name of the collection";

function RunQuery(query) {
    CosmosDBHelper.InitAsync(CosmosDBEndpointUri, CosmosDBAccessKey, CosmosDBDatabaseName, CosmosDBCollectionName)
    CosmosDBHelper.QueryDB(query)
        .then(items => {
            for (let i = 0; i < items.resources.length; i++) {
                console.log(JSON.stringify(items.resources[i], null, 3));
            }
        });
}

async function RunAnalyzing(subscriptionKey, endpoint, link, throttle = 0) {
    var imgPr;
    var attempt = 0;
    var delayPr;
    while (typeof imgPr == "undefined" && attempt < 10) {
        imgPr = await VisionHelper.AnalyzeImage(subscriptionKey, endpoint, link, throttle);
        delayPr = await delay(attempt*15000, { value: 'Done' }); //20 img per 1 min for F0
        attempt++;
    }
    return await imgPr;
}

function PrintHelp() {
    console.log(`
    Images Analyzing Utility.

       available parameters:
          -process [directory name]  - to process images in directory
          -query [your query] - to run query against processed images

      utility usage examples:  
          node .\\index.js -process c:\\temp\\  
          node .\\index.js -query "select * from images"  
    
    `)
}

function main() {
    
}

main();