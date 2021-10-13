/*
 * adds ETF menu to Google Sheets which allows to pull ETF/BPIF data from MOEX to Quotes sheet
 * alternatively use =MOEXFINANCE_ARRAY() function in any cell needed
 *
 * API description
 * https://habr.com/en/post/487436/
 * https://iss.moex.com/iss/reference/
 *
 */
/**
 * Get quote or other security data from MOEX.
 * Similar to GooglFinance formula.
 *
 * @param {string} ticker Ticker at MOEX.
 * @param {string} column Column to get, default = CLOSE. 
 * Other options TRADEDATE SHORTNAME NUMTRADES VALUE OPEN LOW HIGH LEGALCLOSEPRICE WAPRICE CLOSE VOLUME MARKETPRICE2
 * @customfunction
 */
 function MOEXFINANCE(ticker, column = 'CLOSE') {

  // call api for shares / ETFs
  var rows = getRows(ticker, "TQTF") // ETFs
  if (rows.length == 0)
    rows = getRows(ticker, "TQBR") // shares

  // convert and return
  if (column == "CLOSE")
    return rows
  else
    return rows
}

/*
 * set request url for api described at https://iss.moex.com/iss/reference/817
 * example: https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/1/boards/TQTF/securities/FXRL.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off
 */
function getRows(ticker, board) {
  var url = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/${board}/securities/${ticker}.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off`
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  return  object.history.data
}