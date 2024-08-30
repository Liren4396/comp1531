/**
 * NOTE: Tests for the checkPassword should be written first,
 * before implementing the function below.
 * @module password
 */

// check if string has a number
function if_number(password) {
  for (const word of password) {
    if (word >= '0' && word <= '9') {
      return true
    }
  }
  return false
}

function if_uppercase(password) {
  for (const word of password) {
    if (word >= 'A' && word <= 'Z') {
      return true
    }
  }
  return false
}


function if_lowercase(password) {
  for (const word of password) {
    if (word >= 'a' && word <= 'z') {
      return true
    }
  }
  return false
}


/**
 * Checks the strength of the given password and returns a string
 * to represent the result.
 *
 * The returned string (in Title Case) is based on the requirements below:
 * - "Strong Password"
 *     - at least 12 characters long
 *     - at least  1 number
 *     - at least  1 uppercase letter
 *     - at least  1 lowercase letter
 * - "Moderate Password"
 *     - at least  8 characters long
 *     - at least  1 letter (upper or lower case)
 *     - at least  1 number
 * - "Horrible Password"
 *     - passwords that are exactly any of the top 5 (not 20) passwords
 *     from the 2021 Nordpass Ranking:
*      - https://en.wikipedia.org/wiki/List_of_the_most_common_passwords
 * - "Poor Password"
 *     - any password that is not horrible, moderate or strong.
 *
 * 
 
 * @param {string} password to check
 * @returns {string} string to indicate the strength of the password.
 */
export function checkPassword(password) {
  // srong password
  if (password.length >= 12 && if_number(password) 
  && if_lowercase(password) && if_uppercase(password)) {
    return "Strong Password"
  } else if (password.length >= 8 && if_number(password) 
  && (if_lowercase(password) || if_uppercase(password))) {
    return "Moderate Password"
  } else if (password == "123456" || password == "123456789" 
  || password == "12345" || password == "qwert" || password == "password") {
    return "Horrible Password"
  } else {
    return "Poor Password"
  }
}

/**
 * Testing will no longer be done in here.
 * See password.test.js
 */
