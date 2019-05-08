const express = require('express');
const bodyParser = require('body-parser');
const dateformat = require('dateformat');
const config = require('./config/config.js').config;

const foodCalcRepository = require('./db/food-calc/food-calc-repository');

const indexController = require('./routes/index-controller');
const productsController = require('./routes/products-controller');
const portionsController = require('./routes/portions-controller');

process.env.NODE_ENV = 'dev';

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views', './views')

app.use('product/scripts', express.static(__dirname + "/public/scripts"));
app.use('/scripts', express.static(__dirname + "/public/scripts"));
app.use('product/styles', express.static(__dirname + "/public/styles"));
app.use('/styles', express.static(__dirname + "/public/styles"));
app.use('product/images', express.static(__dirname + "/crawler/data/images"));
app.use('/images', express.static(__dirname + "/crawler/data/images"));

app.get('/', indexController.index);  
app.post('/day', indexController.setDay);

app.get('/search', productsController.searchProduct);
app.get('/product', productsController.findProduct);

app.post('/portion', portionsController.addPortion);
app.patch('/portion', portionsController.updatePortion);
app.delete('/portion', portionsController.removePortion);

let userName = "nos";
let nosId;
let day = dateformat(new Date(), "yyyy-mm-dd");
let todaysNeed;

async function addNos(cb){
    foodCalcRepository.findUserByName(userName, r => {
        if (r.length == 0)
            foodCalcRepository.insertUser({name : userName}, r => {
                console.log(`User inserted with id ${r.insertId}.`);
                nosId = Number.parseInt(r.insertId);
                cb()
            });
        else cb()
    })
}

async function addNosNeeds(cb){
    foodCalcRepository.findUserNeedsByUserName(userName, r => {
        if (r.length == 0){
            let userNeeds = {
                user : {id : nosId},
                energy : 3340,
                protein : 170,
                carbohydrates : 530,
                fat : 60,
                startDate : dateformat(new Date(), "yyyy-mm-dd")
            }
            foodCalcRepository.insertUserNeeds(userNeeds, r => {
                console.log(`UserNeed inserted with id ${r.insertId}`);
                cb()
            });
        }
        else cb()
    })
}

async function setTodaysNeed(){
    foodCalcRepository.findUserNeedsValuesByUserName(userName, r => {
        let userNeed = r[0]
        todaysNeed = {
            energy : userNeed.energy,
            protein : userNeed.protein,
            carbohydrates : userNeed.carbohydrates,
            fat : userNeed.fat
        }
        console.log(todaysNeed)
    })
}

app.listen(config.node_port, config.node_host, async function() {
    console.log(`App is listening on port ${config.node_port}...`)
    foodCalcRepository.findPortionByDate(day, r => todaysPortions = r)
    addNos(() => addNosNeeds(() => setTodaysNeed()));
})

module.exports = {
    setNewDay : function(newDay, cb){
        day = newDay;
        cb();
    },    
    getTodaysNeed : function(){
        return todaysNeed;
    },
    getDay : function(){
        return day;
    }
}
