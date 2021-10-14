/**
 * Get ETF/Stocks data from MOEX. 
 * Last available historical data is returned.
 * Similar to GooglFinance formula.
 *
 * @param {string} ticker Ticker at MOEX.
 * @param {string} date YYYY-MM-DD format, get data closest (down) to specified date. 
 * @customfunction
 */
function MOEXFINANCE(ticker,date) {
  // call api for shares / ETFs; should be one of specified boards
  // TODO: get board by ticker using api method
  var data = fetchData(ticker, "TQTF",date) // ETFs
  if (!data)
    data = fetchData(ticker, "TQBR",date) // shares
  return data
}

/*
 * set request url for api described at https://iss.moex.com/iss/reference/817
 * example: https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/1/boards/TQTF/securities/FXRL.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off
 */
function fetchData(ticker, board, date) {

  var url = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/${board}/securities/${ticker}.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off`
  if (date)
    url = url + `&till=${date}`

  var jsondata = UrlFetchApp.fetch(url);
  var object = JSON.parse(jsondata.getContentText());
  var res = []

  if (!object.history.data.length)
    return null

  for (i = 0; i < object.history.columns.length; i++) {
    res.push([object.history.columns[i], object.history.data[0][i]])

  }
  return res
}