const { Builder, By, Key, promise, until } = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox')

async function buyMeTicket(){
    const smoke = "https://evenea.pl/imprezy/koncerty/pleszew/red-smoke-festival-2019--12-1407-215129"
    const link1 = "https://evenea.pl/imprezy/konferencje/02-460-warszawa/waves-blockchain-day-powered-by-waves-platform-blockchain-alliance-and-partners-217676/"
    const link2 = "https://evenea.pl/imprezy/konferencje/warszawa/xiv-konferencja-sieci-przedsiebiorczych-kobiet-future-of-work-215801/"
    driver.get(smoke)
    
    const select = await driver.findElement(By.xpath("//ul[@id='myTab']/li/a[contains(@href, 'ceny')]"))
        .then(priceElement => priceElement.click())
        .then(e => getTableRow(2))
        .then(row => getSelect(row))
        .catch(ex => { console.log(new Date() + " : NIE MA BILETÓW"); buyMeTicket()})
	
        driver.executeScript("window.scrollBy(0,300)");

        if (select != null){
            select.click()
                .then(e => getLastOptionElement(select))
                .then(e => e.click())
                .then(e => getSubmitButton())
                .then(button => driver.executeScript("arguments[0].click();", button));
        }
}

function getTableRow(rowNumber){
    return driver.wait(until.elementLocated(By.xpath("//table[@id='ticketChoose']/tbody/tr[" + rowNumber + "]")), 1000)
            .then(e => driver.findElement(By.xpath("//table[@id='ticketChoose']/tbody/tr[" + rowNumber + "]")))
}

function getSelect(row){
    return row.findElement(By.xpath("td[@class='tdNumberOf right']/select"))
}

function getLastOptionElement(select){
    return select.findElement(By.xpath("option[6]"))
}

function getSubmitButton(){
    return driver.findElement(By.xpath("//form[@id='formTickets']//input[@type='submit']"))
}

async function click(element){
    const actions = driver.actions({bridge: true})
    await actions.move({origin: element})
        .click(element)
        .perform()
}

try {
    driver = new Builder()
        .forBrowser('firefox')
        //.setFirefoxOptions(new firefox.Options().headless())
        .build()
    driver.manage().window().maximize();
    buyMeTicket()
} catch(e) {
    console.log(e)
}