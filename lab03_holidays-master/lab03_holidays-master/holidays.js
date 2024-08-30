// TODO: Add more imports here.
import promptSync from 'prompt-sync';
import {getDay, getDate, getMonth, getYear} from 'date-fns';
import {getValentinesDay, getEaster, getChristmas} from 'date-fns-holiday-us';



function checktheday(string) {
  if (getDay(string) == 0) {
    return 'Sunday';
  } else if (getDay(string) == 1) {
    return 'Monday';
  } else if (getDay(string) == 2) {
    return 'Tuesday';
  } else if (getDay(string) == 3) {
    return 'Wednesday';
  } else if (getDay(string) == 4) {
    return 'Thursday';
  } else if (getDay(string) == 5) {
    return 'Friday';
  } else if (getDay(string) == 6) {
    return 'Saturday';
  }
}


function checkday(string) {
  let day = getDate(string)
  if (day < 10 && day> 0) {
    return '0' + day;
  } else {
    return day;
  }
}

function checkmonth(string) {
  let month = getMonth(string)
  ++month
  if (month < 10 && month > 0) {
    return '0' + month;
  } else {
    return month;
  }
}

function checkyear(string) {
  let year = getYear(string)
  if (year < 1000 && year > 325) {
    return '0' + year;
  } else {
    return year;
  }
}

/**
 * Given a starting year and an ending year:
 * - If `start` is not at least 325, return an empty array.
 * - If `start` is strictly greater than `end`, return an empty array.
 * - Otherwise, return an array of objects containing information about the valentine,
 * easter and christmas date strings in the given (inclusive) range.
 *
 * An example format for christmas in 1970 is
 * - Friday, 25.12.1970
 *
 * @param {number} start - starting year, inclusive
 * @param {number} end - ending year, inclusive
 * @returns {Array<{valentinesDay: string, easter: string, christmas: string}>}
 */
export function holidaysInRange(start, end) {
  
  if (start < 325) {
    return [];
  } else if (start > end) {
    return [];
  } else {

    let holidaysArray = [{}, {}, {}];
    holidaysArray[0]['valentinesDay'] = '0';
    holidaysArray[0]['easter'] = '0';
    holidaysArray[0]['christmas'] = '0';
    let count = 0;
    while (start < end + 1) {

      let valentines = getValentinesDay(start);
      let easter = getEaster(start);
      let christmas = getChristmas(start);

      holidaysArray[count]['valentinesDay'] = checktheday(valentines) + ', ' 
      + checkday(valentines) + '.' + checkmonth(valentines) + '.' + checkyear(valentines);

      holidaysArray[count]['easter'] = checktheday(easter) + ', ' 
      + checkday(easter) + '.' + checkmonth(easter) + '.' + checkyear(easter);

      holidaysArray[count]['christmas'] = checktheday(christmas) + ', ' 
      + checkday(christmas) + '.' + checkmonth(christmas) + '.' + checkyear(christmas);

      ++count;
      ++start;
    }
    
    return holidaysArray;

  }

}

/**
 * TODO: Implement the two lines in the "main" function below.
 * This function is imported and called in main.js
 */
export function main() {
  const prompt = promptSync();
  const start = parseInt(prompt('Enter start: ')); // FIXME use prompt and parseInt()
  const end = parseInt(prompt('Enter end: ')); // FIXME use prompt and parseInt()

  const holidays = holidaysInRange(start, end);
  console.log(holidays);
}
