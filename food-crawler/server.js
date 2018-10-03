const express = require('express');
const bodyParser = require('body-parser');
const productRepository = require('./product-repository');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views', './views')

const port = 80;
const todaysProducts = [];

app.get('/', (req, res) => {
    res.render('index', { products: todaysProducts })
});

app.get('/product', (req, res) => {
    productRepository.search(req.query.query)
        .then(r => {
            res.render('products', { products: r.hits.hits.map(h => h._source) })
        });
});

app.get('/products', (req, res) => {
    res.sendFile('products.js', { root: __dirname })
});

app.post('/todaysProduct', (req, res) => {
    productRepository.findByProductName(req.body.productName)
        .then(r => {
            product = r.hits.hits[0]._source
            todaysProducts.push(product)
            res.send("Found product: " + product)
        });
});


app.listen(port, "localhost", () => console.log(`App is listening on port ${port}...`))