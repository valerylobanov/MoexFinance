// 
// API description
// https://habr.com/en/post/487436/
// https://iss.moex.com/iss/reference/
// 
// TODO:
// 1) Get Indices from MOEX (MCFTR): https://iss.moex.com/iss/history/engines/stock/markets/index/boards/RTSI/securities/MCFTR
// 2) Get first available quote for specified ETF
// 




// add menu item to UI
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('ETF')
    .addItem('Get MOEX quotes', 'getMoexQuotes')
    .addToUi();
}

// write data to Quotes sheet
function getMoexQuotes() {

  // get current or create new Quotes sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheetName = "Quotes"
  var sheet = spreadsheet.getSheetByName(sheetName)
  if (!sheet) {
    spreadsheet.insertSheet(sheetName)
    sheet = spreadsheet.getSheetByName(sheetName)
  } else {
    sheet.clear()
  }

  // get quotes from MOEX
  quotes = MOEXFINANCE_ARRAY()

  // write data to sheet
  sheet.getRange(1, 1, quotes.length, 4).setValues(quotes)

}


// get data from MOEX 
function MOEXFINANCE_ARRAY() {

  // set api call url

  var board = ["TQTF", "TQBR"]
  var array = []

  // api pulls max 100 pages at a time
  // TODO: get number dynamically (there's parameter in API)
  const maxPages = 3
  for (var j = 0; j < board.length; j++) {
    for (var k = 0; k < maxPages; k++) {
      var url = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/${board[j]}/securities.xml?iss.meta=off&start=${k * 100}`


      // get xml response
      var xml = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true
      }).getContentText();
      var document = XmlService.parse(xml);
      var root = document.getRootElement();
      var rows = root.getChildren()[0].getChildren()[0].getChildren()

      // process xml response
      for (var i = 0; i < rows.length; i++) {
        var secId = rows[i].getAttribute("SECID").getValue();
        var close = Number(rows[i].getAttribute("CLOSE").getValue());
        var tradeDate = rows[i].getAttribute("TRADEDATE").getValue();
        var shortName = rows[i].getAttribute("SHORTNAME").getValue();
        array.push([tradeDate, secId, close,shortName])
      }
    }
  }

  return array

}

////////////////////////// PUBLIC METHODS /////////////////////////////////////////////////////

function getTable(tickers, prevYears = [0]) {

  array = []

  // set header
  array.push(_getTableHeader(prevYears))

  // get quotes
  for (let i = 0; i < tickers.length; i++) {

    let row = [tickers[i]]

    // get last available quote
    let lq = _getLastQuote(tickers[i])
    row.push(lq.date, lq.lastQuote)

    // get prev year's quotes for each year
    let today = new Date()
    for (let j = 0; j < prevYears.length; j++) {
      let d = getPrevCloseDay(today, prevYears[j])
      let q = _getQuoteByDate(tickers[i], d)
      row.push(d, q)
    }

    array.push(row)
  }
  return array
}

////////////////////////// PRIVATE METHODS /////////////////////////////////////////////////////

function _getTableHeader(prevYears) {
  let a = ['MOEX TICKER', 'LAST QUOTE DATE', 'LAST QUOTE']
  for (i = 0; i < prevYears.length; i++) {
    a.push(`Y-${prevYears[i]} DATE`)
    a.push(`Y-${prevYears[i]} CLOSE`)
  }
  return a
}

/*
 * get close quote for security/date

 */
function _getQuoteByDate(moexTicker, date) {

  var date = date.yyyymmdd() // as required by API
  // https://iss.moex.com/iss/history/engines/stock/markets/index/boards/RTSI/securities/MCFTR

  let url = `https://iss.moex.com/iss/history/engines/stock`

  if (moexTicker == `MCFTR`)
    url = url + `/markets/index/boards/RTSI`
  else
    url = url + `/markets/shares/boards/TQTF`

  url = url + `/securities/${moexTicker}/history?iss.meta=off&history.columns=CLOSE`
    + `&till=${date}&from=${date}`

  // get xml response
  var root = _getXmlRoot(url);
  var row = root.getChild('data').getChild('rows').getChild('row')

  // return row attribute value
  return _getRowNumber(row, "CLOSE")

}

/*
 * get last available quote for security
 */
// https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQTF/securities/FXUS
function _getLastQuote(moexTicker) {

  // api call url
  url = `https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQTF/securities/${moexTicker}?iss.meta=off`

  // get xml response
  var root = _getXmlRoot(url);
  var row = root.getChildren()[1].getChild('rows').getChild('row')

  let d = _getRowDate(row, "SYSTIME")
  let q = _getRowNumber(row, "LAST")
  return { 'date': d, 'lastQuote': q }

}


////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////////////

/*
 * call API and get received xml doc's root element
 */
function _getXmlRoot(url) {

  let xml = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  }).getContentText();

  return XmlService.parse(xml).getRootElement();
}

// get number attribute from xml row
function _getRowNumber(row, attributeName) {
  if (row)
    return Number(row.getAttribute(attributeName).getValue())
  else
    return null
}

// get row attribute from xml row
function _getRowDate(row, attributeName) {
  if (row)
    return Date(row.getAttribute(attributeName).getValue())
  else
    return null
}

////////////////////////// TEST FUNCTIONS /////////////////////////////////////////////////////

function test_getLastQuote() {
  Logger.log(_getLastQuote('FXRU'))
}

function test_getTable() {
  Logger.log(getTable(['FXRU']))
}
