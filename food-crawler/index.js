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

let todaysNeed;

async function saveTodaysPortions(cb){
    todaysPortions.filter(p => null == p.id)
        .forEach(p => foodCalcRepository.insertPortion(p, r => {
            p.id = r.insertId;
            console.log(`Portion inserted with id ${r.insertId}.`);
        }));
    cb()
}

async function addTodaysPortion(productJson, quantity, cb){
    let now = dateformat(new Date(), "yyyy-mm-dd")
    todaysPortions.push({
        id : null, 
        productJson : productJson, 
        quantity : quantity, 
        date : now,
        user : { id : 1 }
    })
    cb()
}

async function updatePortion(productId, quantity, cb){
    console.log(productId, " : ",quantity)
    let portion = todaysPortions.find(p => p.productJson._id == productId);
    portion.quantity = quantity;
    if(portion.id != null)
        foodCalcRepository.updatePortionQuantity(portion.id, quantity, r => {
            console.log(`Portion updated ${r}.`);
        })
    cb();
}

async function removePortionByProductId(productId, cb){
    let curProduct = todaysPortions.find(p => p.productJson._id == productId)
    let index = todaysPortions.indexOf(curProduct);
    todaysPortions.splice(index, 1);
    if(curProduct.id != null)
        foodCalcRepository.deletePortion(curProduct.id, r => {
            console.log(`Portion removed ${r}.`);
        })
    cb();
}

function calculatePortionValues(productJson, quantity){
    const product = productJson._source
    return {
        productId : productJson._id,
        name : product.productName,
        quantity: quantity,
        energy : (product.nutritionalValues.energy * 100 * quantity / (100 * 100)).toFixed(2),
        protein : (product.nutritionalValues.protein * 100 * quantity / (100 * 100)).toFixed(2),
        carbohydrates : (product.nutritionalValues.carbohydrates * 100 * quantity / (100 * 100)).toFixed(2),
        fat : (product.nutritionalValues.fat * 100 * quantity / (100 * 100)).toFixed(2)
    }
}

function calculateEatenToday(){
    const isEmpty = todaysPortions.length == 0
    return {
        quantity : isEmpty ? 0 : todaysPortions.map(p => p.quantity).reduce((a,b) => sum(a, b)),
        energy : isEmpty ? 0 : todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)).map(p => p.energy).reduce((a,b) => sum(a, b)),
        protein : isEmpty ? 0 : todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)).map(p => p.protein).reduce((a,b) => sum(a, b)),
        carbohydrates : isEmpty ? 0 : todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)).map(p => p.carbohydrates).reduce((a,b) => sum(a, b)),
        fat : isEmpty ? 0 : todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)).map(p => p.fat).reduce((a,b) => sum(a, b))
    }
}

function sum(a, b){
    return (1000 * a + 1000 * b) / 1000;
}

app.get('/', (req, res) => {
    res.render('index', { 
        todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
        foundProducts: [], 
        todaysNeed: todaysNeed,
        eatenToday: calculateEatenToday()
    });
    console.log(todaysPortions)
});

app.get('/product', (req, res) => {
    productRepository.search(req.query.query)
        .then(r => {
            res.render('index', { 
                todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
                foundProducts: r.hits.hits.map(h => h._source),
                todaysNeed: todaysNeed,
                eatenToday: calculateEatenToday()
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
            addTodaysPortion(r, parseInt(req.body.quantity), () => {
                res.render('index', { 
                    todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
                    foundProducts: [], 
                    todaysNeed: todaysNeed,
                    eatenToday: calculateEatenToday()
                });
            });
        });
});

app.post('/portion', (req, res) => {
    saveTodaysPortions(() => res.send("Portions saved"))
});

app.patch('/portion', (req, res) => {
    updatePortion(req.body.productId, req.body.quantity, r => {
        res.render('portions-table', { 
            todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
            foundProducts: [], 
            todaysNeed: todaysNeed,
            eatenToday: calculateEatenToday()
        })
        console.log(`Portion with product ${req.body.productId} updated`);       
    })
});

app.delete('/portion', (req, res) => {
    removePortionByProductId(req.body.productId, () => {
        res.render('portions-table', { 
            todaysPortions: todaysPortions.map(p => calculatePortionValues(p.productJson, p.quantity)), 
            foundProducts: [], 
            todaysNeed: todaysNeed,
            eatenToday: calculateEatenToday()
        })
        console.log(`Portion with product ${req.body.productId} removed`);
    })
});

async function addNos(cb){
    foodCalcRepository.getUsersList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUser({name : "nos"}, r => {
                console.log(`User inserted with id ${r.insertId}.`);
                cb()
            });
        else cb()
    })
}

async function addNosNeeds(cb){
    foodCalcRepository.getUsersNeedsList(r => {
        if (r.length == 0)
            foodCalcRepository.insertUserNeeds({
                user : {id : 1},
                energy : 3340,
                protein : 170,
                carbohydrates : 530,
                fat : 60,
                startDate : dateformat(new Date(), "yyyy-mm-dd")
            }, r => {
                console.log(`UserNeed inserted with id ${r.insertId}`);
                cb()
            });
        else cb()
    })
}

async function setTodaysNeed(){
    foodCalcRepository.getUserNeedsValues(1, r => {
        let userNeed = r[0]
        todaysNeed = {
            energy : userNeed.energy,
            protein : userNeed.protein,
            carbohydrates : userNeed.carbohydrates,
            fat : userNeed.fat
        }
        eatenToday = {
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
    addNos(() => addNosNeeds(() => setTodaysNeed()));
})