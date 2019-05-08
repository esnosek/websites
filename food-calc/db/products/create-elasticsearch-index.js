const elasticsearch = require('elasticsearch');
const glob = require("glob");
var fs = require('fs');

const config = require('../../config/config.js').config;

const indexName = "food-index";

const client = new elasticsearch.Client({
  host: config.elasticsearch.host,
  log: config.elasticsearch.log
});

async function createIndexAndInsertData(){
  if(await !indexExists())
    await createIndex()
  addProducts()
}

async function indexExists(){
  let exists = true;
  client.indices.exists({index: indexName}, (err, res, status) => {
    if(err) throw err;
    exists = res
  });
  return exists;
}

async function createIndex(){
  client.indices.create({index: indexName}, (err, res, status) => {
    if(err) throw err;
    console.log("Create", res);
  });
}

async function addProducts(){
  glob("../../crawler/data/json/**/*.json", {matchBase:true}, (err, res) => {
    if (err) throw err;
    addAll(res)
  });
}

function addAll(files){
  const data = []
  files.forEach(f => {
    let json = JSON.parse(fs.readFileSync(f, 'utf8'))
    data.push({ index:  { _index: indexName, _type: 'product', _id: json.id} });
    data.push(json)
  });
  client.bulk({
    body : JSON.parse(JSON.stringify(data))
  })
}

createIndexAndInsertData()
