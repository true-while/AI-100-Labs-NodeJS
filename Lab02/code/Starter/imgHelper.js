'use strict';
const sharp = require('sharp');
const path = require("path");
const tmp = require('temporary');

module.exports = {

    readMetadata: function (metadata, maxDim) {
        var width = metadata.width;
        var height = metadata.height;
        if (width > maxDim || height > maxDim) {
            if (width >= height) {
                width = maxDim;
                height = Math.floor(parseFloat(maxDim * metadata.height) / (metadata.width));
            }
            else {
                height = maxDim;
                width = Math.floor(parseFloat(maxDim * metadata.width) / (metadata.height));
            }
        }
        return { resize: (width != metadata.width || height != metadata.height), width: width, height: height };
    },
    ResizeIfRequired: function (imageFile, maxDim) {

        var file = new tmp.File();

        var info;
        return sharp(imageFile)
            .metadata()
            .then((m) => {
                info = m;
                return this.readMetadata(m, maxDim);
            })
            .then((m) => {
                if (m.resize) {
                    return new Promise((resolve) => {
                        sharp(imageFile)
                            .resize(m.width, m.height)
                            .toFile(file.path, function (err) {
                                if (err == null) {
                                    console.log(`Image '${imageFile}' was successfully resized`)
                                }
                                var result = {
                                    width: m.width,
                                    height: m.height,
                                    src: file.path
                                };
                                resolve(result);
                            })
                    });
                } else {
                    return new Promise((resolve) => {
                        console.log(`Resize not required for '${imageFile}'`);
                        var result = {
                            width: info.width,
                            height: info.height,
                            src: imageFile
                        };
                        resolve(result);
                    });
                }
            })
    }
}