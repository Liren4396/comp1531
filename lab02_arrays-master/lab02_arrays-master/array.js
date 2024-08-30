/**
 * Compute the sum of the integer array.
 * If the array is empty, the sum is 0.
 *
 * @param {Array<number>} array of integers
 * @returns {number} the sum of the array
 */
function arraySum(array) {
  // FIXME
  var sum = 0;
  for (var i = 0; i < array.length; ++i) {
    sum += array[i];
  }
  return sum;
}

/**
 * Compute the product of the given integer array.
 * If the array is empty, the product is 1.
 *
 * @param {Array<number>} array of integers
 * @returns {number} the product of the array
 */
function arrayProduct(array) {
  // FIXME
  var product = 1;
  for (var i of array) {
    product *= i;
  }
  return product;
}

/**
 * Find the smallest number in the array
 *
 * @param {Array<number>} array of integers
 * @returns {number|null} the smallest number in the array, or
 * null if the array is empty
 */
function arrayMin(array) {
  // FIXME
  var min = null;
  for (var i of array) {
    if (min == null) {
      min = i;
    } else if (i < min) {
      min = i;
    }
  }
  return min;
}

/**
 * Find the largest number in the array
 *
 * @param {Array<number>} array of integers
 * @returns {number|null} the largest number in the array, or
 * null if the array is empty
 */
function arrayMax(array) {
  // FIXME
  var max = null;
  for (var i of array) {
    if (max == null) {
      max = i;
    } else if (i > max) {
      max = i;
    }
  }
  return max;
}

/**
 * Determine if the array contains a particular element.
 *
 * @param {Array<number>} array of integers
 * @param {number} item integer to check
 * @returns {boolean} whether the integer item is in the given array
 */
function arrayContains(array, item) {
  // FIXME: true or false instead of null
  for (var i of array) {
    if (i == item) {
      return true;
    }
  }
  return false;
}

/**
 * Create an array that is the reversed of the original.
 *
 * WARNING: a reminder that the original(s) array must not be modified.
 * You can create new arrays if needed.
 *
 * @param {Array<number>} array of integers
 * @returns {Array<number>} a new reversed array
 */
function arrayReversed(array) {
  // FIXME
  var result = [];
  for (var i = array.length - 1; i >= 0; i--) {
    result.push(array[i]);
  }
  return result;
}

/**
 * Returns the first element in the array
 *
 * @param {Array<number>} array of integers
 * @returns {number|null} the first element in the array,
 * or null if the array is empty
 */
function arrayHead(array) {
  // FIXME
  if (array.length === 0) {
    return null;
  } else {
    return array[0];
  }
  
}

/**
 * Return all elements in the array after the head.
 *
 * WARNING: a reminder that the original(s) array must not be modified.
 * You can create new arrays if needed.
 *
 * @param {Array<number>} array of integers
 * @returns {Array<number>|null} an array of elements excluding the head,
 * or null if the input array is empty
 */
function arrayTail(array) {
  if (array.length === 0) {
    return null;
  } else {
    return array[array.length - 1];
  }
}

/**
 * Given two arrays, multiply the elements at each index from arrays and store
 * the result in a third array. If the given two arrays differ in length,
 * excess elements of the larger array will be added on at the end.
 *
 * For example,
 *     [1, 3, 2]
 *   x [2, 4, 3, 5, 9]
 *   -----------------
 *   = [2, 12, 6, 5, 9]
 *
 * The result will be the same if array1 and array2 are swapped.
 *
 * @param {Array<number>} array1 of integers
 * @param {Array<number>} array2 of integers
 * @returns {Array<number>} array1 x array2 at each index
 */
function arraysMultiply(array1, array2) {
  // FIXME
  var result = [];
  var i = 0, j = 0;
  for (; i < array1.length && j < array2.length; ++i, ++j) {
    var product = array1[i] * array2[j];
    result.push(product);
  }

  while (i != array1.length) {
    result.push(array1[i]);
    ++i;
  }
  while (j != array2.length) {
    result.push(array2[j]);
    ++j;
  }
  return result;
}

/**
 * Create a third array containing common elements between two arrays.
 *
 * Each element in the first array can map to at most one element
 * in the second array, and vice versa (one-to-one relationship).
 * 
 * Duplicated elements in each array are treated as separate entities.
 *
 * The order is determined by the first array.
 *
 * A few examples,
 *   arraysCommon([1,1], [1,1,1]) gives [1,1]
 *   arraysCommon([1,1,1], [1,1]) gives [1,1]
 *   arraysCommon([1,2,3,2,1], [5,4,3,2,1]) gives [1,2,3]
 *   arraysCommon([1,2,3,2,1], [2,2,3,3,4]) gives [2,3,2]
 *   arraysCommon([1,4,1,1,5,9,2,7], [1,8,2,5,1]) gives [1,1,5,2]
 *
 * WARNING: a reminder that the original array(s) must not be modified.
 * You can create new arrays if needed.
 *
 * @param {Array<number>} array1 of integers
 * @param {Array<number>} array2 of integers
 * @returns {Array<number>} number of common elements between two arrays
 */
function arraysCommon(array1, array2) {
  var position_used = [];
  var result = [];
  for (var i = 0; i < array1.length; ++i) {
    for (var j = 0; j < array2.length; ++j) {
      if (array1[i] === array2[j]) {
        var flag = 0;
          for (var z of position_used) {
            if (z == j) {
              // element already used
              flag = 1;
            }
          }
        if (flag == 0) {
          position_used.push(j);
          result.push(array1[i]);
          break;
        }
      }
    }
  }
  return result;
}

// ========================================================================= //

/**
 * Debugging code
 */

console.assert(arraySum([1, 2, 3, 4]) === 10, 'arraySum([1,2,3,4]) === 10');
console.assert(arrayProduct([1, 2, 3, 4]) === 24, 'arrayProduct([1,2,3,4]) === 24');

/**
 * NOTE: you can't directly compare two arrays with `===`, so you may need
 * to come up with your own way of comparing arrays this week. For example, you
 * could use console.log() and observe the output manually.
 */
console.log();
console.log('Testing : arrayCommon([1,2,3,2,1], [2,2,3,3,4])');
console.log('Received:', arraysCommon([1, 2, 3, 2, 1], [2, 2, 3, 3, 4]));
console.log('Expected: [ 2, 3, 2 ]');
console.log();

// TODO: your own debugging here
console.log(arraysCommon([1,1], [1,1]));
console.log(arraysCommon([1,1,1], [1,1]));
console.log(arraysCommon([1,2,3,2,1], [5,4,3,2,1]));
console.log(arraysCommon([1,4,1,1,5,9,2,7], [1,8,2,5,1]));


console.log(arrayMax([999, 888, 777]));
console.log(arrayMin([999, 888, 777]));

console.log(arrayContains([999, 888, 777], 777));
console.log(arrayReversed([999, 888, 777]));


console.log(arrayHead([777, 888, 999]))

console.log(arrayTail([777, 888, 999]))

console.log(arrayTail([]))

console.log(arraysMultiply([1, 3, 2], [2, 4, 3, 5, 9]))


console.log(arraysCommon([1, 2, 3], [4, 5, 6]));