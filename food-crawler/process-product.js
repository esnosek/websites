const rp = require('request-promise')
const request = require('request')
const accents = require('remove-accents')
const http = require('http')
const fs = require('fs')

async function processData(result){
    const name = getName(result["link"])
    const dataDir = "data" + "\\" + name
    processedResult = {}
    processedResult["images"] = await downloadImages(result, dataDir)
    processedResult["categoryName"] = result["categoryName"]
    processedResult["productName"] = result["productName"]
    processedResult["nutritionalValues"] = await processNutritionalValues100g(result)
    processedResult["nutritionalValuesPhoto"] = await processNutritionalValuesPhoto(result)
    processedResult["information"] = await processInformation(result)
    saveJSON(processedResult, dataDir, name)
}

async function saveJSON(result, dataDir, name){
    const fileName = dataDir + "\\" + name + ".json"
    fs.writeFile(fileName, JSON.stringify(result, null, 4), function (err) {})
    console.log(JSON.stringify(result, null, 4))
}

async function processNutritionalValues100g(result){
    const index = result["nutritionalValues"][0].findIndex(e => e == '100g')
    return processNutritionalValues(result["nutritionalValues"], index)
}

async function processNutritionalValuesPhoto(result){
    const index100g = result["nutritionalValues"][0].findIndex(e => e == '100g')
    const index = index100g == 1 ? 2 : 1
    return processNutritionalValues(result["nutritionalValues"], index)
}

async function processNutritionalValues(rows, col){
    const values = {}
    rows.forEach(r => {
        key = normalizeKey(r[0])
        value = normalizeNumberValue(r[col])
        if(key && !isNaN(value)) values[key] = normalizeNumberValue(r[col])
    })
    values["weight"] = normalizeNumberValue(rows[0][col])
    return values
}

async function processInformation(result){
    const values = {}
    result["information"].forEach(e => values[normalizeKey(e[0])] = e[1])
    return values    
}

async function downloadImages(result, dataDir){
    const imgPaths = []
    for(link of result["imagesLinks"])
        await downloadImage(link, dataDir, getName(link), n => imgPaths.push(n))
    return imgPaths
}

async function downloadImage(url, dataDir, name, cb){
    const fullPath = dataDir + "\\" + name
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    await rp(url, {encoding: 'binary'}, function(error, response, body){
        fs.writeFileSync(fullPath, body, 'binary', function (err) {});
    }).then(() => cb(name))
}

function getName(url){
    return new URL(url).pathname.split("/").slice(-1)[0]
}

function normalizeKey(key){
    return accents.remove(key)
    .toLowerCase()
    .replace(':', '')
    .replace(/\benergia\b/, "energy")
    .replace(/\bbialko\b/, "protein")
    .replace(/\btluszcz\b/, "fat")
    .replace(/\bkwasy tluszczowe nasycone\b/, "saturatedFattyAcids")
    .replace(/\bweglowodany\b/, "carbohydrates")
    .replace(/\bcukry proste\b/, "simpleSugars")
    .replace(/\bblonnik\b/, "roughage")
    .replace(/\bsol\b/, "salt")
    .replace(/\bsklad\b/, "ingredients")
    .replace(/\bproducent\b/, "producer")
    .replace(/\bmarka\b/, "brand")
    .replace(/\binformacje\b/, "information")
    .trim()
}

function normalizeNumberValue(value){
    let response = ""
    try {
        response = value.includes("kcal") ? value.match(/[0-9]+/g)[0] : value.includes("g") ? value.match(/[0-9]+,*[0-9]*/g)[0].replace(',','.') : ""
    } finally {
        return response == "" ? NaN : Number(response)
    }
}

exports.processData = processData