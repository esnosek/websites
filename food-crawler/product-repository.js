const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: '192.168.33.10:9200',
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
