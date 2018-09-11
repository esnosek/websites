let http = require('http')
let fs = require('fs')
let webdriver = require('selenium-webdriver')
let until = webdriver.until
let By = webdriver.By
let Key = webdriver.Key
let accents = require('remove-accents')

async function collectProducts() {
    if(!fs.existsSync("images")) fs.mkdirSync("images")
    driver.get("http://www.ilewazy.pl")
    await clickAcceptButton()
    await clickToProducts()
    const mainHandle = await driver.getWindowHandle()
    while(true){
        const productsLinks = await collectProductsOnPage()
        console.log('links', productsLinks)
        for(const link of productsLinks) {
	        await openInNewTab(link)
            await processData(link)
            await driver.close()
            await driver.switchTo().window(mainHandle)
        }
        await click(await getNextPageButton())
    }
}

async function clickAcceptButton() {
    const button = await driver.wait(until.elementLocated(By.xpath("//*[@class=\"btn accept-targeting-disclaimer-button\"]")), 3000)
        .then(async (element) => { return await driver.wait(until.elementIsVisible(element), 3000)})
    await button.click()
}

async function clickToProducts() {
    const productCategories = await driver.wait(until.elementLocated(By.xpath("//ul/li/a[@href=\"/produkty\"]")), 3000)
    await click(productCategories)
    console.log("clickToProducts")
}

async function collectProductsOnPage() {
    const products = await driver.wait(until.elementLocated(By.id("thumbnails")), 30000)
    .then(e => driver.findElements(By.xpath("//ul[@id=\"thumbnails\"]/li/div[@class=\"subtitle\"]/a")))
    return Promise.all(products.map(async (p) => await p.getAttribute("href")))
}

async function openInNewTab(link){
    await driver.executeScript("window.open()")
    const handles = await driver.getAllWindowHandles()
    await driver.switchTo().window(handles[1])
    await driver.get(link)
    console.log('openInNewTab')
}

async function processData(link){

    console.log("\nI AM PROCESSING " +  link)

    const metaInfo = await driver.wait(until.elementLocated(By.xpath("//span[@itemprop=\"name\"]")), 30000)
    .then(e => driver.findElements(By.xpath("//span[@itemprop=\"name\"]")))
    
    const category = await metaInfo[1].getText()
    const productName = await metaInfo[2].getText()

    const ingredientsTable= await driver.wait(until.elementLocated(By.id("ilewazy-ingedients")), 30000)
    .then(e => driver.findElement(By.id("ilewazy-ingedients")))

    const theadRow = await ingredientsTable.findElements(By.xpath(".//thead/tr/th"))
    const theadTexts = await Promise.all(theadRow.map(t => t.getText()))
    const hundredGramsText = await ingredientsTable.findElement(By.xpath(".//thead/tr/th[@class=\"colper100g\"]")).getText()
    const photoGramsText = await ingredientsTable.findElement(By.xpath(".//thead/tr/th[@class=\"colperphoto\"]")).getText()

    const hundredGramsIndex = theadTexts.findIndex(t => t == hundredGramsText)
    const photoGramsIndex = theadTexts.findIndex(t => t == photoGramsText)

    const tbodyRows = await ingredientsTable.findElements(By.xpath(".//tbody/tr"))

    const hundredGrams = {}
    hundredGrams["waga"] = 100
    const photoGrams = {}
    photoGrams["waga"] = normalizeValue(theadTexts[photoGramsIndex])

    for(let row of tbodyRows){
        const cells = await row.findElements(By.xpath(".//td"))
        const cellsTexts = await Promise.all(cells.map(c => c.getText()))
        const key = normalizeKey(cellsTexts[0])
        hundredGrams[key] = normalizeValue(cellsTexts[hundredGramsIndex])
        if(hundredGrams[key] == "") delete hundredGrams[key]
        photoGrams[key] = normalizeValue(cellsTexts[photoGramsIndex])
        if(photoGrams[key] == "") delete photoGrams[key]
    }

    console.log(hundredGrams)
    console.log(photoGrams)

    /*
    let energy
    let protein
    let carbohydrates
    let simpleSugars
    let fat
    let saturatedFattyAcids
    let roughage
    let salt
    */

   const informationTable= await driver.wait(until.elementLocated(By.xpath("//*[@class=\"product-data table table-condensed\"]")), 30000)
   .then(e => driver.findElement(By.xpath("//*[@class=\"product-data table table-condensed\"]")))
   const informationRows = await informationTable.findElements(By.xpath(".//tbody/tr"))

   const information = {}

    for(let row of informationRows){
        const cells = await row.findElements(By.xpath(".//td"))
        const cellsTexts = await Promise.all(cells.map(c => c.getText()))
        information[normalizeKey(cellsTexts[0]).toLowerCase().replace(':', '')] = cellsTexts[1]
    }

    console.log(information)

    /*
    let ingredients
    let producer
    let brand
    let information
    */

   const images = await driver.wait(until.elementLocated(By.xpath("//div/a[@rel=\"lightbox['wazenie']\"]")), 30000)
   .then(e => driver.findElements(By.xpath("//div/a[@rel=\"lightbox['wazenie']\"]/img/..")))

   imagesLinks = await Promise.all(images.map(async (p) => await p.getAttribute("href")))
   imagesLinks.forEach(imgLink => downloadImage(imgLink, link.split("/").slice(-1)[0], imgLink.split("/").slice(-1)[0] + ".jpg"))

   // let images

   console.log("\n")
}

function normalizeKey(key){
    return accents.remove(key).toLowerCase().replace(':', '')
}

function normalizeValue(value){
    let response = ""
    try{
        response = value.includes("kcal") ? value.match(/[0-9]+/g)[0] : value.includes("g") ? value.match(/[0-9]+,*[0-9]+/g)[0].replace(',','.') : ""
    } finally {
        return response == "" ? response : Number(response)
    }
}

function getName(path) {
    EncodeUrl(path).nameWithExtension
}

async function downloadImage(url, dir, name){
    if(!fs.existsSync("images" + "\\" + dir)) fs.mkdirSync("images" + "\\" + dir)
    var file = fs.createWriteStream("images" + "\\" + dir + "\\" + name)
    var request = http.get(url, r => r.pipe(file))
}

async function getNextPageButton(){
    const pageButtons = await driver.wait(until.elementLocated(By.xpath("//div[@class=\"pagination  paginator-top\"]//li/a")), 30000)
    .then(e => driver.findElements(By.xpath("//div[@class=\"pagination  paginator-top\"]//li/a")))
    return pageButtons.pop()    
}

async function click(element){
    const actions = driver.actions({bridge: true})
    await actions.move({origin: element})
        .click(element)
        .perform()
}

try {
    driver = new webdriver.Builder().forBrowser('chrome').build()
    collectProducts()
} catch(e) {
    console.log(e)
}