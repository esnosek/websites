const express = require('express');
const bodyParser = require('body-parser');
const productRepository = require('./product-repository');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views', './views')

app.use('/scripts', express.static(__dirname + "/scripts"));
app.use('/styles', express.static(__dirname + "/styles"));

const port = 8081;
const todaysProducts = [];
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

function addProduct(product, quantity){
    productValues = calculateProductValues(product, quantity);
    todaysProducts.push(productValues);
    updateEatenToday(productValues);
    updateTodayToEat(productValues);
}

function calculateProductValues(product, quantity){
    return {
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

app.get('/', (req, res) => {
    res.render('index', { 
        todaysProducts: todaysProducts, 
        foundProducts: [], 
        todayToEat: todayToEat,
        eatenToday: eatenToday
    });
});

app.get('/product', (req, res) => {
    productRepository.search(req.query.query)
        .then(r => {
            res.render('index', { 
                todaysProducts: todaysProducts, 
                foundProducts: r.hits.hits.map(h => h._source), 
                todayToEat: todayToEat,
                eatenToday: eatenToday
            });
        });
});

app.post('/product/search', (req, res) => {
    productRepository.findByProductName(req.body.productName)
        .then(r => {
            res.send(r.hits.hits[0]._source)
        });
});

app.post('/addProduct', (req, res) => {
    productRepository.findByProductName(req.body.productName)
        .then(r => {
            const product = r.hits.hits[0]._source
            addProduct(product, parseInt(req.body.quantity))
            res.render('index', { 
                todaysProducts: todaysProducts, 
                foundProducts: [], 
                todayToEat: todayToEat,
                eatenToday: eatenToday
            });
        });
});


app.listen(port, "localhost", () => console.log(`App is listening on port ${port}...`))