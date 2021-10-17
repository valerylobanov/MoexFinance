/*
 * Google sheet library to enabe MOEXFINANCE custom function
 * test file: https://docs.google.com/spreadsheets/d/1GFxPdG_oGjfSoxTJvCz-ipNvL_8w2MVyT_tVy5JDyRE/edit?usp=sharing
 * GitHub repo: https://github.com/valerylobanov/MoexFinance
 */

/**
 * Get ETF/Stocks data from MOEX. 
 * Last available historical data is returned.
 * Similar to GooglFinance formula.
 *
 * @param {string} ticker Ticker at MOEX.
 * @param {string} date YYYY-MM-DD format, get data closest (down) to specified date / end date fo CPI calculation
 * @param {string} dateStart YYYY-MM-DD format, start date for CPI calculation
 * @customfunction
 */
 function MOEXFINANCE(ticker, date, dateStart) {
  if (ticker == "CPI:RUB")
    return fetchGksData(date,dateStart)

  // call api for shares / ETFs; should be one of specified boards
  // TODO: get board by ticker using api method
  var data = fetchMoexData(ticker, "TQTF", date) // ETFs
  if (!data)
    data = fetchMoexData(ticker, "TQBR", date) // shares
  return data
}

/*
 * set request url for api described at https://iss.moex.com/iss/reference/817
 * example: https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/1/boards/TQTF/securities/FXRL.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off
 */
function fetchMoexData(ticker, board, date) {

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

/*
 * set request url for api described at https://www.statbureau.org/ru/inflation-api
 * example: https://www.statbureau.org/calculate-inflation-rate-jsonp?country=russia&start=2021-01-01&end=2021-08-01
 */
function fetchGksData(date, dateStart) {  
  var url = `https://www.statbureau.org/calculate-inflation-rate-json?country=russia&start=${dateStart}&end=${date}`
   var jsondata = UrlFetchApp.fetch(url);
   return parseFloat(jsondata.getContentText().replace('"','').replace('"',''))/100
}