const elasticsearch = require('elasticsearch');

const config = require('../../config/config.js').config;

const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: config.elasticsearch.log
});


async function search(product){
    return await client.search({
        index: 'food-index',
        type: 'product',
        body: {
            size : 12,
            query: {
                match: {
                    productName: product
                }
            }
        }
    })
}

async function findByProductName(name){
    return await client.search({
        index: 'food-index',
        type: 'product',
        body: {
            query : {
                constant_score : { 
                    filter : {
                        term : { 
                            "productName.keyword" : name
                        }
                    }
                }
            }
        }
    })
}

async function findById(id){
    return await client.get({
        index: 'food-index',
        type: 'product',
        id: id
      });
}

module.exports = {
    search: search,
    findByProductName: findByProductName,
    findById: findById
};
