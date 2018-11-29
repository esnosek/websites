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
app.use('/data', express.static(__dirname + "/data"));

let todaysPortions = [];

let eatenToday;
let todaysNeed;

function saveTodaysPortions(){
    todaysPortions.filter(p => null == p.id)
        .forEach(p => foodCalcRepository.insertPortion(p, r => {
            p.id = r.insertId;
            console.log(`Portion inserted with id ${result.insertId}.`);
        }));
}

function addTodaysPortion(productJson, quantity){
    let now = dateformat(new Date(), "yyyy-mm-dd")
    todaysPortions.push({
        id : null, 
        productJson : productJson, 
        quantity : quantity, 
        date : now,
        user : { id : 1 }
    })
}

function row(){

}

function updatePortion(productId, quantity){
    console.log(productId, " : ",quantity)
    let portion = todaysPortions.find(p => p.productJson._id == productId)
    portion.quantity = quantity
    if(portion.id != null)
        foodCalcRepository.updatePortionQuantity(curProduct.id, quantity, r => {
            console.log(`Portion updated ${r}.`);
        })
    return portion
    }

function removePortionByProductId(productId){
    let curProduct = todaysPortions.find(p => p.productJson._id == productId)
    let index = todaysPortions.indexOf(curProduct);
    todaysPortions.splice(index, 1);
    if(curProduct.id != null)
        foodCalcRepository.deletePortion(curProduct.id, r => {
            console.log(`Portion removed ${r}.`);
        })
}

function calculatePortionValues(productJson, quantity){
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

function updateTodaysNeed(product){
    todaysNeed.energy = Math.round((todaysNeed.energy - productValues.energy) * 100) / 100;
    todaysNeed.protein = Math.round((todaysNeed.protein - productValues.protein) * 100) / 100;
    todaysNeed.carbohydrates = Math.round((todaysNeed.carbohydrates - productValues.carbohydrates) * 100) / 100;
    todaysNeed.fat = Math.round((todaysNeed.fat - productValues.fat) * 100) / 100;
}

app.get('/', (req, res) => {
    res.render('index', { 
        todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
        foundProducts: [], 
        todaysNeed: todaysNeed,
        eatenToday: eatenToday
    });
    console.log(todaysPortions)
});

app.get('/product', (req, res) => {
    console.log("WYSZUKUJE PO NAZWIE")
    productRepository.search(req.query.query)
        .then(r => {
            res.render('index', { 
                todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
                foundProducts: r.hits.hits.map(h => h._source),
                todaysNeed: todaysNeed,
                eatenToday: eatenToday,
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
                todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
                foundProducts: [], 
                todaysNeed: todaysNeed,
                eatenToday: eatenToday,
            });
        });
});

app.post('/portion', (req, res) => {
    saveTodaysPortions()
    res.send("Portions saved")
});

app.patch('/portion', (req, res) => {
    let portion = updatePortion(req.body.productId, req.body.quantity)
    res.send(JSON.stringify(calculatePortionValues(portion.productJson, portion.quantity)))
});

app.delete('/portion', (req, res) => {
    removePortionByProductId(req.body.productId)
    res.send(`Portion with product ${req.body.productId} removed`)
});

async function addNos(){
    foodCalcRepository.getUsersList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUser({name : "nos"}, r => {
                console.log(`User inserted with id ${result.insertId}.`);
            });
    })
}

async function addNosNeeds(){
    foodCalcRepository.getUsersNeedsList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUserNeeds({
                user : {id : 1},
                energy : 3340,
                protein : 170,
                carbohydrates : 530,
                fat : 60,
                startDate : dateformat(new Date(), "yyyy-mm-dd")
            }, r => {s
                console.log(`UserNeed inserted with id ${result.insertId}`);
            });
    })
}

addNos()
addNosNeeds()

app.listen(config.node_port, config.node_host, () => {
    console.log(`App is listening on port ${config.node_port}...`)
    foodCalcRepository.getUserNeedsValues(1, r => {
        uderNeed = r[0]
        todaysNeed = {
            energy : uderNeed.energy,
            protein : uderNeed.protein,
            carbohydrates : uderNeed.carbohydrates,
            fat : uderNeed.fat
        }
        eatenToday = {
            energy : uderNeed.energy,
            protein : uderNeed.protein,
            carbohydrates : uderNeed.carbohydrates,
            fat : uderNeed.fat
        }
        console.log(todaysNeed)
    })
})