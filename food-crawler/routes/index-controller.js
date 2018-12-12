const calculatePortionValues = require('../utils').calculatePortionValues
const calculateEatenToday = require('../utils').calculateEatenToday
const foodCalcRepository = require('../db/food-calc/food-calc-repository');

async function index(req, res){
    foodCalcRepository.findPortionByDate(require('../index').getDay(), portions => {
        console.log(portions)
        res.render('index', { 
            todaysPortions: portions.map(p => calculatePortionValues(p)), 
            todaysNeed: require('../index').getTodaysNeed(),
            eatenToday: calculateEatenToday(portions),
            day: require('../index').getDay()
        });
    });   
}

async function setDay(req, res){
    require('../index').setNewDay(req.body.day, () => res.send("Day changed"));
}

module.exports = {
    index : index,
    setDay : setDay
}
