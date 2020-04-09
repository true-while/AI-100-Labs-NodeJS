'use strict';
const cosmosClient = require('@azure/cosmos').CosmosClient;


var client;
var databaseId;
var containerId;
var partitionKey;

module.exports = {

    InitAsync: async function (endpoint, key, dbId, cntrId )
    {
        client = new cosmosClient({ endpoint, key });
        databaseId = dbId;
        containerId = cntrId;
        partitionKey = { kind: "Hash", paths: ["/id"] };
       
        var pr = new Promise((resolve)=> {
            client.databases.createIfNotExists({ id: databaseId })
            resolve(databaseId);
        });       

        return new Promise((resolve)=> {
    
            return pr
            .then(databaseId => {
                client.database(databaseId).containers.createIfNotExists({ id: containerId, partitionKey }, { offerThroughput: 400 });
            }).then(resolve(containerId));            
        });
    },

    QueryDB: function (query)
    {
         return client
        .database(databaseId)
        .container(containerId)
        .items
        .query(query)
        .fetchAll();
    },
    UpdateDocument: function (item) {

        client.database(databaseId)
            .container(containerId)
            .items
            .upsert(item)
            .then(console.log(`Document with id '${item.id}' created`));        
            
    }
}