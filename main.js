/*
 * adds ETF menu to Google Sheets which allows to pull ETF/BPIF data from MOEX to Quotes sheet
 * alternatively use =MOEXFINANCE() function in any cell needed
 *
 * API description
 * https://habr.com/en/post/487436/
 * https://iss.moex.com/iss/reference/
 *
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
  sheet.getRange(1, 1, quotes.length, 4).setValues(quotes)

}


// get data from MOEX 
function MOEXFINANCE() {

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
