const fs = require('fs')
const webdriver = require('selenium-webdriver')
const until = webdriver.until
const By = webdriver.By
const productEventEmitter = require('./event-emiter').productEventEmitter

async function collectProducts() {
    if(!fs.existsSync("data")) fs.mkdirSync("data")
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
        .then(e => driver.wait(until.elementIsVisible(e), 3000))
    await button.click()
}

async function clickToProducts() {
    const productCategories = await driver.wait(until.elementLocated(By.xpath("//ul/li/a[@href=\"/produkty\"]")), 3000)
    await click(productCategories)
}

async function collectProductsOnPage() {
    return await driver.wait(until.elementLocated(By.id("thumbnails")), 30000)
        .then(e => driver.findElements(By.xpath("//ul[@id=\"thumbnails\"]/li/div[@class=\"subtitle\"]/a")))
        .then(e => Promise.all(e.map(async (p) => await p.getAttribute("href"))))
}

async function openInNewTab(link){
    await driver.executeScript("window.open()")
    const handles = await driver.getAllWindowHandles()
    await driver.switchTo().window(handles[1])
    await driver.get(link)
}

async function processData(link){
    console.log("\nI AM PROCESSING " +  link)
    const result = {}
    result["link"] = link
    result["categoryName"] = await getCategoryName()
    result["productName"] = await getProductName()
    result["nutritionalValues"] = await getNutritionalValues()
    result["information"] = await getInformationTable()
    result["imagesLinks"] = await getImagesLinks()
    productEventEmitter.emit("collected", result)
    return result
}

async function getCategoryName(){
    const metaInfo = await driver.wait(until.elementLocated(By.xpath("//span[@itemprop=\"name\"]")), 30000)
        .then(e => driver.findElements(By.xpath("//span[@itemprop=\"name\"]")))
        return metaInfo[1].getText()
}

async function getProductName(){
    const metaInfo = await driver.wait(until.elementLocated(By.xpath("//span[@itemprop=\"name\"]")), 30000)
        .then(e => driver.findElements(By.xpath("//span[@itemprop=\"name\"]")))
    return metaInfo[2].getText()
}

async function getImagesLinks(){
    return await driver.wait(until.elementLocated(By.xpath("//div/a[@rel=\"lightbox['wazenie']\"]")), 30000)
        .then(e => driver.findElements(By.xpath("//div/a[@rel=\"lightbox['wazenie']\"]/img/..")))
        .then(e => Promise.all(e.map(p => p.getAttribute("href"))))
}

async function getInformationTable(){
    const resultTable = []
    const informationRows = await driver.wait(until.elementLocated(By.xpath("//*[@class=\"product-data table table-condensed\"]")), 30000)
        .then(e => driver.findElements(By.xpath("//*[@class=\"product-data table table-condensed\"]//tbody/tr")))
    for(let r of informationRows){
        const cellsTexts = await r.findElements(By.xpath(".//td"))
            .then(e => Promise.all(e.map(c => c.getText())))
        resultTable.push(cellsTexts)
    }
    return resultTable
}

async function getNutritionalValues(){
    const resultTable = []
    const nutritionalValuesTable = await driver.wait(until.elementLocated(By.id("ilewazy-ingedients")), 30000)
        .then(e => driver.findElement(By.id("ilewazy-ingedients")))
    const theadTexts = await nutritionalValuesTable.findElements(By.xpath(".//thead/tr/th"))
        .then(e => Promise.all(e.map(t => t.getText())))
    resultTable.push(theadTexts)
    const tbodyRows = await nutritionalValuesTable.findElements(By.xpath(".//tbody/tr"))
    for(let r of tbodyRows){
        const cellsTexts = await r.findElements(By.xpath(".//td"))
            .then(e => Promise.all(e.map(c => c.getText())))
        resultTable.push(cellsTexts)
    }
    return resultTable
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