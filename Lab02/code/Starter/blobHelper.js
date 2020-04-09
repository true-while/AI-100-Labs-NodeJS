'use strict';
//https://github.com/Azure/azure-storage-node

const path = require("path");
var azure = require('azure-storage');

var blobService;
var blobContainerName;

module.exports = {

    InitAsync: function (connectionString, containerName) {

        blobService = azure.createBlobService(connectionString);
        blobContainerName = containerName;
        return new Promise((resolve, reject) => {
            blobService.createContainerIfNotExists(containerName, {
                publicAccessLevel: 'blob'
            }, function (error, result, response) {
                if (!error) {
                    console.log(`Container ${containerName} was created`);
                }
                resolve();
            });
        });
    },

    UploadToBlob: function (blobContainerName, blobName, localFilePath) {
        return new Promise((resolve, reject) => {
            blobService.createBlockBlobFromLocalFile(
                blobContainerName, blobName, localFilePath,
                function (error, result, response) {
                    if (!error) {
                        console.log(`Upload file ${blobName} succeeds`);
                        resolve();
                    }
                    else {
                        console.log(`Upload file failed ${error}`);
                        reject();
                    }
                })

        });
    },

    UploadImage: function (localFilePath, fileName) {

        var blobName = path.basename(fileName);

        return new Promise((resolve) => {
            this.UploadToBlob(blobContainerName, blobName, localFilePath)
                .then(() => {
                    var link = blobService.getUrl(blobContainerName, blobName)
                    resolve(link);
                });
        });

    }
}
