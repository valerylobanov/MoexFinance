/*
 * date to YYYY-MM-DD string 
 */
Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
  (mm > 9 ? '' : '0') + mm,
  (dd > 9 ? '' : '0') + dd
  ].join('');
};

/*
 * previous working day
 */
function getPrevCloseDay(date, prevYears = 0) {

  d = new Date(date)
  d.setFullYear(d.getFullYear() - prevYears)

  if (d.getMonth() == 0 && d.getDate() < 11) // Jan 1-10
  {
    d.setFullYear(d.getFullYear() - 1)
    d.setMonth(12)
    d.setDate(31)
  } else if (d.getMonth() == 4 && d.getDate() < 11) // Jan 1-10
  {
    d.setFullYear(d.getFullYear() - 1)
    d.setMonth(3)
    d.setDate(30)
  } else {
    let dw = d.getDay()
    if (dw == 0)
      d.setDate(d.getDate() - 2)
    else if (dw == 6)
      d.setDate(d.getDate() - 1)
  }
  return d

}


