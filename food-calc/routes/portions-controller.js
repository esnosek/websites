const calculatePortionValues = require('../utils').calculatePortionValues
const calculateEatenToday = require('../utils').calculateEatenToday
const productRepository = require('../db/products/product-repository');
const foodCalcRepository = require('../db/food-calc/food-calc-repository');
const isNumber = require('is-number');

async function addPortion(req, res){
    productRepository.findById(req.body.productId)
        .then(r => {
            const portion = {
                id : null, 
                productJson : r, 
                quantity : parseInt(req.body.quantity), 
                date : require('../index').getDay(),
                user : { id : 1 }
            };
            foodCalcRepository.insertPortion(portion, r => {
                portion.id = r.insertId;
                foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
                    res.render('index', {
                        todaysPortions: portions.map(p => calculatePortionValues(p)), 
                        todaysNeed: require('../index').getTodaysNeed(),
                        eatenToday: calculateEatenToday(portions),
                        day: require('../index').getDay()
                    });
                });
            });
        });
}

async function updatePortion(req, res){
    if(isNumber(req.body.quantity))
        foodCalcRepository.updatePortionQuantity(req.body.portionId, req.body.quantity, r => {
            foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
                res.render('portions-table', { 
                    todaysPortions: portions.map(p => calculatePortionValues(p)), 
                    todaysNeed: require('../index').getTodaysNeed(),
                    eatenToday: calculateEatenToday(portions)
                })
            });
            console.log(`Portion with product ${req.body.productId} updated`);       
        })
    else
        foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
            res.render('portions-table', { 
                todaysPortions: portions.map(p => calculatePortionValues(p)), 
                todaysNeed: require('../index').getTodaysNeed(),
                eatenToday: calculateEatenToday(portions)
            })
        });    
}

async function removePortion(req, res){
    foodCalcRepository.deletePortion(req.body.portionId, () => {
        foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
            res.render('portions-table', { 
                todaysPortions: portions.map(p => calculatePortionValues(p)), 
                todaysNeed: require('../index').getTodaysNeed(),
                eatenToday: calculateEatenToday(portions)
            })
        });
        console.log(`Portion ${req.body.portionId} removed`);
    })
}

module.exports = {
    addPortion : addPortion,
    updatePortion : updatePortion,
    removePortion : removePortion
}