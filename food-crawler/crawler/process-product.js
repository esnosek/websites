const rp = require('request-promise')
const accents = require('remove-accents')
const fs = require('fs')
const url = require('url')
const linux = true
const delimiter = linux ? "/" : "\\"

async function processData(result){
    const id = getName(result["link"])
    const jsonDir = "data" + delimiter + "json"
    const imgDir = "data" + delimiter + "images" + delimiter + id
    processedResult = {}
    processedResult["id"] = id
    processedResult["images"] = await downloadImages(result, imgDir)
    processedResult["categoryName"] = result["categoryName"]
    processedResult["productName"] = result["productName"]
    processedResult["nutritionalValues"] = await processNutritionalValues100g(result)
    processedResult["nutritionalValuesPhoto"] = await processNutritionalValuesPhoto(result)
    processedResult["information"] = await processInformation(result)
    saveJSON(processedResult, jsonDir, id)
}

async function saveJSON(result, dataDir, name){
    const fileName = dataDir + delimiter + name + ".json"
    resultJSON = JSON.stringify(result, null, 4)
    fs.writeFile(fileName, resultJSON, function (err) {})
    //console.log(resultJSON)
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
    for(it in result["imagesLinks"]){
        let link = result["imagesLinks"][it]
        let name = it == 0 ? "main-" + await getName(link) : await getName(link)
        await downloadImage(link, dataDir, name, n => imgPaths.push(n))
    }
    return imgPaths
}

async function downloadImage(url, dataDir, name, cb){
    const fullPath = dataDir + delimiter + name
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    await rp(url, {encoding: 'binary'}, function(error, response, body){
        fs.writeFileSync(fullPath, body, 'binary', function (err) {});
    }).then(() => cb(name))
}

function getName(link){
    return url.parse(link, true).pathname.split("/").slice(-1)[0]
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