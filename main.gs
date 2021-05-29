/*
 * adds ETF menu to Google Sheets which allows to pull ETF/BPIF data from MOEX to Quotes sheet
 */


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
  quotes = MOEXFINANCE()

  // write data to sheet
  sheet.getRange(1, 1, quotes.length, 3).setValues(quotes)

}


// get data from MOEX 
function MOEXFINANCE() {

  // set api call url
  url = "https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/TQTF/securities.xml?iss.meta=off"

  // get xml responce
  var xml = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  }).getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  var rows = root.getChildren()[0].getChildren()[0].getChildren()

  // process xml responce
  var array = []
  for (var i = 0; i < rows.length; i++) {
    var secId = rows[i].getAttribute("SECID").getValue();
    var close = Number(rows[i].getAttribute("CLOSE").getValue());
    var tradeDate = rows[i].getAttribute("TRADEDATE").getValue();
    array.push([tradeDate, secId, close])
  }

  return array

}
