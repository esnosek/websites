const express = require('express');
const bodyParser = require('body-parser');
const dateformat = require('dateformat');

const productRepository = require('./db/products/product-repository');
const foodCalcRepository = require('./db/food-calc/food-calc-repository');
const config = require('./config/config.js').config;

process.env.NODE_ENV = 'dev';

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views', './views')

app.use('/scripts', express.static(__dirname + "/scripts"));
app.use('/styles', express.static(__dirname + "/styles"));

let todaysPortions = [];

const todayToEat = {
    energy: 3340.0,
    protein: 170.0,
    carbohydrates: 530.0,
    fat: 60.0
}

const eatenToday = {
    quantity: 0,
    energy: 0.0,
    protein: 0.0,
    carbohydrates: 0.0,
    fat: 0.0
}

function saveTodaysPortions(){
    todaysPortions.filter(p => null == p.id)
        .forEach(p => foodCalcRepository.insertPortion(p, r => {
            p.id = r.insertId; 
        }));
}

function updatePortion(productId, quantity){
    console.log(productId, " : ",quantity)
    todaysPortions.find(p => p.productJson._id == productId).quantity = quantity
    // TODO change value of visible row
    }

function removePortionByProductId(productId){
    let curProduct = todaysPortions.find(p => p.productJson._id == productId)
    let index = todaysPortions.indexOf(curProduct);
    todaysPortions.splice(index, 1);
    if(curProduct.id != null)
        foodCalcRepository.deletePortion(curProduct.id, r => console.log(r))
}

function addTodaysPortion(productJson, quantity){
    let now = dateformat(new Date(), "yyyy-mm-dd")
    todaysPortions.push({id : null, productJson : productJson, quantity : quantity, date : now, user : {id : 1}})
}

function calculateProductValues(productJson, quantity){
    const product = productJson._source
    return {
        productId : productJson._id,
        name : product.productName,
        quantity: quantity,
        energy : product.nutritionalValues.energy * 1000 * quantity / (100 * 1000),
        protein : product.nutritionalValues.protein * 1000 * quantity / (100 * 1000),
        carbohydrates : product.nutritionalValues.carbohydrates * 1000 * quantity / (100 * 1000),
        fat : product.nutritionalValues.fat * 1000 * quantity / (100 * 1000)
    }
}

function updateEatenToday(product){
    eatenToday.quantity = Math.round((eatenToday.quantity + productValues.quantity) * 100) / 100;
    eatenToday.energy = Math.round((eatenToday.energy + productValues.energy) * 100) / 100;
    eatenToday.protein = Math.round((eatenToday.protein + productValues.protein) * 100) / 100;
    eatenToday.carbohydrates = Math.round((eatenToday.carbohydrates + productValues.carbohydrates) * 100) / 100;
    eatenToday.fat = Math.round((eatenToday.fat + productValues.fat) * 100) / 100;
}

function updateTodayToEat(product){
    todayToEat.energy = Math.round((todayToEat.energy - productValues.energy) * 100) / 100;
    todayToEat.protein = Math.round((todayToEat.protein - productValues.protein) * 100) / 100;
    todayToEat.carbohydrates = Math.round((todayToEat.carbohydrates - productValues.carbohydrates) * 100) / 100;
    todayToEat.fat = Math.round((todayToEat.fat - productValues.fat) * 100) / 100;
}

async function addNos(){
    foodCalcRepository.getUsersList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUser({name : "nos"});
    })
}

async function addNosNeeds(){
    foodCalcRepository.getUsersList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUser({name : "nos"});
    })
}

app.get('/', (req, res) => {
    res.render('index', { 
        visiblePortions: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
        foundProducts: [], 
        todayToEat: todayToEat,
        eatenToday: eatenToday
    });
    console.log(todaysPortions)
});

app.get('/product', (req, res) => {
    productRepository.search(req.query.query)
        .then(r => {
            res.render('index', { 
                visiblePortions: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
                foundProducts: r.hits.hits.map(h => h._source), 
                todayToEat: todayToEat,
                eatenToday: eatenToday
            });
        });
});

app.post('/product/search', (req, res) => {
    productRepository.findByProductName(req.body.productName)
        .then(r => res.send(r.hits.hits[0]));
});

app.post('/addProduct', (req, res) => {
    productRepository.findById(req.body.productId)
        .then(r => {
            addTodaysPortion(r, parseInt(req.body.quantity))
            res.render('index', { 
                visiblePortions: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
                foundProducts: [], 
                todayToEat: todayToEat,
                eatenToday: eatenToday
            });
        });
});

app.post('/portion', (req, res) => {
    saveTodaysPortions()
    res.send("Portions saved")
});

app.patch('/portion', (req, res) => {
    updatePortion(req.body.productId, req.body.quantity)
    res.send(`Portion with product ${req.body.productId} updated`)
});

app.delete('/portion', (req, res) => {
    removePortionByProductId(req.body.productId)
    res.send(`Portion with product ${req.body.productId} removed`)
});


addNos()
addNosNeeds()

app.listen(config.node_port, config.node_host, () => console.log(`App is listening on port ${config.node_port}...`))