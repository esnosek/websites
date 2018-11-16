const elasticsearch = require('elasticsearch');
const glob = require("glob");
var fs = require('fs');

const client = new elasticsearch.Client({
  host: '192.168.33.11:9200',
  log: 'debug'
});

async function createIndexAndInsertData(){
  await createIndex()
  addProducts()
}

async function createIndex(){
  client.indices.create({index: 'food-index'}, (err, res, status) => {
    if(err) throw err;
    console.log("Create", res);
  });
}

function addProducts(){
  glob("data/**/*.json", {matchBase:true}, (err, res) => {
    if (err) throw err;
    addAll(res)
  });
}

function addAll(files){
  const data = []
  files.forEach(f => {
    data.push({ index:  { _index: 'food-index', _type: 'product'} });
    data.push(JSON.parse(fs.readFileSync(f, 'utf8')))
  });
  client.bulk({
    body : JSON.parse(JSON.stringify(data))
  })
}

createIndexAndInsertData()
