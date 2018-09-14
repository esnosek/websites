const accents = require('remove-accents')
const http = require('http')
const fs = require('fs')

async function processData(result){
    processedResult = {}
    processedResult["images"] = await downloadImages(result)
    processedResult["categoryName"] = result["categoryName"]
    processedResult["productName"] = result["productName"]
    processedResult["nutritionalValues"] = await processNutritionalValues(result)
    processedResult["nutritionalValuesPhoto"] = await processNutritionalValuesPhoto(result)
    processedResult["information"] = await processInformation(result)
    console.log(processedResult)
}

async function processNutritionalValues(result){
    index = result["nutritionalValues"][0].findIndex(e => e == '100g')
    values = {}
    result["nutritionalValues"].forEach(e => {
        key = normalizeKey(e[0])
        value = normalizeNumberValue(e[index])
        if(key && !isNaN(value)) values[key] = normalizeNumberValue(e[index])
    })
    return values
}

async function processNutritionalValuesPhoto(result){
    index100g = result["nutritionalValues"][0].findIndex(e => e == '100g')
    index = index100g == 1 ? 2 : 1
    values = {}
    result["nutritionalValues"].forEach(e => {
        key = normalizeKey(e[0])
        value = normalizeNumberValue(e[index])
        if(key && !isNaN(value)) values[key] = normalizeNumberValue(e[index])
    })
    return values
}

async function processInformation(result){
    values = {}
    result["information"].forEach(e => values[normalizeKey(e[0])] = e[1])
    return values    
}

async function downloadImages(result){
    const productFolder = getName(result["link"])
    imgPaths = []
    result["imagesLinks"].forEach(e => imgPaths.push(downloadImage(e, productFolder, getName(e))))
    return imgPaths
}

async function downloadImage(url, dir, name){
    const dataDir = "data"
    if(!fs.existsSync(dataDir + "\\" + dir)) fs.mkdirSync(dataDir + "\\" + dir)
    const file = fs.createWriteStream(dataDir + "\\" + dir + "\\" + name)

    //ERROR!
    return http.get(url, r => r.pipe(file).on('close', e => dataDir + "\\" + dir + "\\" + name))
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
    try{
        response = value.includes("kcal") ? value.match(/[0-9]+/g)[0] : value.includes("g") ? value.match(/[0-9]+,*[0-9]+/g)[0].replace(',','.') : ""
    } finally {
        return response == "" ? NaN : Number(response)
    }
}

exports.processData = processData