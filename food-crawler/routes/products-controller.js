const calculatePortionValues = require('../utils').calculatePortionValues
const calculateEatenToday = require('../utils').calculateEatenToday
const productRepository = require('../db/products/product-repository');
const foodCalcRepository = require('../db/food-calc/food-calc-repository');

async function searchProduct(req, res){
    productRepository.search(req.query.query)
        .then(r => {
            foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
                console.log(portions)
                res.render('index', { 
                    todaysPortions: portions.map(p => calculatePortionValues(p)), 
                    todaysNeed: require('../index').getTodaysNeed(),
                    eatenToday: calculateEatenToday(portions),
                    foundProducts: r.hits.hits.map(h => h._source),
                    day: require('../index').getDay()
                });
            });
        });
}

async function findProduct(req, res){
    productRepository.findById(req.query.productId)
        .then(r => {
            res.render('search-menu', { 
                product: r._source
            });
        });
}

module.exports = {
    searchProduct : searchProduct,
    findProduct : findProduct
}
