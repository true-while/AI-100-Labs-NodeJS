'use strict';
const fs = require('fs');
const path = require('path')
const delay = require('delay');
var async = require("async");

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

function processFile(file) {
    return function (err, stats) {
        console.log(file);
        console.log(stats["size"]);
    }
}

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
async function ProcessImages(path) {

    await BlobHelper.InitAsync(BlobConnectionString, BlobContainerName);
    await CosmosDBHelper.InitAsync(CosmosDBEndpointUri, CosmosDBAccessKey, CosmosDBDatabaseName, CosmosDBCollectionName)

    var filter = "\\.(jpeg)|(jpg)|(png)|(bmp)";
    fs.readdir(path, async function(err, items) {
        if (typeof items == "undefined") { console.log("no files found");return;}
        for (let i = 0; i < items.length; i++) {
            if (items[i].toLowerCase().match(filter)) {
                var file = path + '/' + items[i];
                await ImgHelper.ResizeIfRequired(file, 750)
                    .then(img => BlobHelper.UploadImage(img.src, file))
                    .then(link => RunAnalyzing(subscriptionKey, endpoint, link))
                    .then(info => CosmosDBHelper.UpdateDocument(info))
                console.log(`done with ${items[i]}`);
            }
        };
    });
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
    var args = process.argv.slice(2);

    switch (args[0]) {
        case '-process':
            var dir = path.resolve(args[1]);
            fs.access(dir, fs.F_OK, (err) => {
                if (err) {
                    console.error("The PATH must exiting folder with images!");
                    return process.exit();
                }
            });
            ProcessImages(dir)
            break;
        case '-query':
            if (!args[1].match("select")) {
                console.log("The QUERY must start from 'select'!");
                return process.exit();
            }
            RunQuery(args[1]);
            break;
        default:
            PrintHelp();
    }
}

main();