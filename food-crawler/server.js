const express = require('express');
const bodyParser = require('body-parser');
const productRepository = require('./product-repository');
const foodCalcRepository = require('./food-calc-repository');
const dateformat = require('dateformat');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views', './views')

app.use('/scripts', express.static(__dirname + "/scripts"));
app.use('/styles', express.static(__dirname + "/styles"));

const port = 8080;
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

function removePortionByProductId(productId){
    let curProduct = todaysPortions.find(p => p.productJson._id == productId)
    let index = todaysPortions.indexOf(curProduct);
    todaysPortions.splice(index, 1);
    // TODO remove from db
}

function removePortion(portionId){
    let curProduct = todaysPortions.find(p => p.id == portionId)
    let index = todaysPortions.indexOf(curProduct);
    todaysPortions.splice(index, 1);
}

function addPortion(productJson, quantity){
    let now = dateformat(new Date(), "yyyy-mm-dd")
    todaysPortions.push({id : null, productJson : productJson, quantity : quantity, date : now, user : {id : 1}})
    productValues = calculateProductValues(productJson, quantity);
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
    foodCalcRepository.getUsersList(result => {
        if (result.length == 0)
            foodCalcRepository.insertUser({name : "nos"});
    })
}

app.get('/', (req, res) => {
    res.render('index', { 
        visibleProducts: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
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
                visibleProducts: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
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
            addPortion(r, parseInt(req.body.quantity))
            res.render('index', { 
                visibleProducts: todaysPortions.map(p => calculateProductValues(p.productJson, p.quantity)), 
                foundProducts: [], 
                todayToEat: todayToEat,
                eatenToday: eatenToday
            });
        });
});

app.post('/portion', (req, res) => {
    saveTodaysPortions()
    res.send("Products saved")
});

app.post('/quantity', (req, res) => {
    let productName = req.body.name
    todaysPortions.find(p => p.productJson.productName == "req.body.name").quantity = req.body.quantity
    res.send("Products saved")
});

app.post('/remove', (req, res) => {
    removePortionByProductId(req.body.productId)
    res.send("Product removed")
});

async function test(){
    console.log(await productRepository.findById("QzOVtmYBxlpUyraYyDpa"))
}


addNos()
test()

app.listen(port, "localhost", () => console.log(`App is listening on port ${port}...`))