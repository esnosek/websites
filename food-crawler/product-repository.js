const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'debug'
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

module.exports = {
    search: search,
    findByProductName: findByProductName
};