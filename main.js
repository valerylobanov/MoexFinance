/*
 * API description
 * https://habr.com/en/post/487436/
 * https://iss.moex.com/iss/reference/
 * /

/**
 * Get quote or other security data from MOEX.
 * Similar to GooglFinance formula.
 *
 * @param {string} ticker Ticker at MOEX.
 * @param {string} column Column to get, default = CLOSE. 
 * Other options TRADEDATE SHORTNAME NUMTRADES VALUE OPEN LOW HIGH LEGALCLOSEPRICE WAPRICE CLOSE VOLUME MARKETPRICE2
 * @customfunction
 */
 function MOEXFINANCE(ticker) {
  // call api for shares / ETFs; should be one of specified boards
  // TODO: get board by ticker using api method
  var rows = getRows(ticker, "TQTF") // ETFs
  if (!rows)
    rows = getRows(ticker, "TQBR") // shares
  return rows
}

/*
 * set request url for api described at https://iss.moex.com/iss/reference/817
 * example: https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/1/boards/TQTF/securities/FXRL.xml?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off
 */
function getRows(ticker, board) {
  
  var url = `https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/${board}/securities/${ticker}.json?sort_order=desc&sort_column=TRADEDATE&limit=1&iss.meta=off`
  
  var jsondata = UrlFetchApp.fetch(url);
  var object   = JSON.parse(jsondata.getContentText());
  
  if(!object.history.data.length)
  return null

  var res = []
  for(i=0;i<object.history.columns.length;i++) {
      res.push([object.history.columns[i],object.history.data[0][i]])
      
  }
  return res
  }