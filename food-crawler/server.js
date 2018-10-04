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

const port = 80;
const todaysProducts = [];
const todayToEat = {
    energy: 3340,
    protein: 170,
    carbohydrates: 530,
    fat: 60
}

const eatenToday = {
    energy: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
}

const allValues = {
    quantity : 0,
    energy : 0,
    protein : 0,
    carbohydrates : 0,
    fat : 0
}

function addProduct(product, quantity){
    product.quantity = parseInt(quantity);
    todaysProducts.push(product);
    allValues.quantity += product.quantity
    allValues.energy += product.nutritionalValues.energy;
    allValues.protein += product.nutritionalValues.protein;
    allValues.carbohydrates += product.nutritionalValues.carbohydrates;
    allValues.fat += product.nutritionalValues.fat;

    eatenToday.energy += product.nutritionalValues.energy;
    eatenToday.protein += product.nutritionalValues.protein;
    eatenToday.carbohydrates += product.nutritionalValues.carbohydrates;
    eatenToday.fat += product.nutritionalValues.fat;

    todayToEat.energy -= product.nutritionalValues.energy;
    todayToEat.protein -= product.nutritionalValues.protein;
    todayToEat.carbohydrates -= product.nutritionalValues.carbohydrates;
    todayToEat.fat -= product.nutritionalValues.fat;
}

app.get('/', (req, res) => {
    res.render('index', { 
        todaysProducts: todaysProducts, 
        foundProducts: [], 
        todayToEat: todayToEat,
        eatenToday: eatenToday,
        allValues: allValues
    });
});

app.get('/product', (req, res) => {
    productRepository.search(req.query.query)
        .then(r => {
            res.render('index', { 
                todaysProducts: todaysProducts, 
                foundProducts: r.hits.hits.map(h => h._source), 
                todayToEat: todayToEat,
                eatenToday: eatenToday,
                allValues: allValues
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
            addProduct(product, req.body.quantity)
            res.render('index', { 
                todaysProducts: todaysProducts, 
                foundProducts: [], 
                todayToEat: todayToEat,
                eatenToday: eatenToday,
                allValues: allValues
            });
        });
});


app.listen(port, "localhost", () => console.log(`App is listening on port ${port}...`))