

function swap(Array, i, j) {
  let tmp = Array[i]
  Array[i] = Array[j]
  Array[j] = tmp
  return Array
}

/**
 * Given an array of fast food restaurants, return a new sorted
 * array in descending order by:
 *
 *   1. customerService
 *   2. foodVariety
 *   3. valueForMoney
 *   4. timeToMake
 *   5. taste
 *   6. name (in lexicographical order, case-insensitive)
 *
 * For example, if two restaurant have the same customerService
 * and foodVariety, the one with a higher valueForMoney will be
 * in front (nearer to the start of the returned array).
 *
 * If the all other fields are equal and the name is compared,
 * "hungry Jacks" will be before "KFC" because "h" is before "K".
 *
 * WARNING: You should NOT modify the order of the original array.
 *
 * @param {
 *   Array<{
 *     name: string,
 *     customerService: number,
 *     foodVariety: number,
 *     valueForMoney: number,
 *     timeToMake: number,
 *     taste: number
 *   }>
 * } fastFoodArray with information about fast food restaurants,
 * which should not be modified.
 * @returns array with the same items, sorted by the key-order given.
 */
function sortedFastFood(fastFoodArray) {
  // TODO: Observe the return type from the stub code
  // FIXME: Replace the stub code with your implementation

  for (var i = 0; i < fastFoodArray.length; ++i) {
    for (var j = i + 1; j < fastFoodArray.length; ++j) {
      if (fastFoodArray[i]["customerService"] < fastFoodArray[j]["customerService"]) {
        swap(fastFoodArray, i, j)

      } else if (fastFoodArray[i]["customerService"] == fastFoodArray[j]["customerService"] 
      && fastFoodArray[i]["foodVariety"] < fastFoodArray[j]["foodVariety"]) {
        swap(fastFoodArray, i, j)

      } else if (fastFoodArray[i]["customerService"] == fastFoodArray[j]["customerService"]
      && fastFoodArray[i]["foodVariety"] == fastFoodArray[j]["foodVariety"]
      && fastFoodArray[i]["valueForMoney"] < fastFoodArray[j]["valueForMoney"]) {
        swap(fastFoodArray, i, j)

      } else if (fastFoodArray[i]["customerService"] == fastFoodArray[j]["customerService"]
      && fastFoodArray[i]["foodVariety"] == fastFoodArray[j]["foodVariety"]
      && fastFoodArray[i]["valueForMoney"] == fastFoodArray[j]["valueForMoney"] 
      && fastFoodArray[i]["timeToMake"] < fastFoodArray[j]["timeToMake"]) {
        swap(fastFoodArray, i, j)

      } else if (fastFoodArray[i]["customerService"] == fastFoodArray[j]["customerService"]
      && fastFoodArray[i]["foodVariety"] == fastFoodArray[j]["foodVariety"]
      && fastFoodArray[i]["valueForMoney"] == fastFoodArray[j]["valueForMoney"] 
      && fastFoodArray[i]["timeToMake"] == fastFoodArray[j]["timeToMake"]
      && fastFoodArray[i]["taste"] == fastFoodArray[j]["taste"]) {
        swap(fastFoodArray, i, j)

      } else if (fastFoodArray[i]["customerService"] == fastFoodArray[j]["customerService"]
      && fastFoodArray[i]["foodVariety"] == fastFoodArray[j]["foodVariety"]
      && fastFoodArray[i]["valueForMoney"] == fastFoodArray[j]["valueForMoney"] 
      && fastFoodArray[i]["timeToMake"] == fastFoodArray[j]["timeToMake"]
      && fastFoodArray[i]["taste"] == fastFoodArray[j]["taste"]
      && fastFoodArray[i]["name"] > fastFoodArray[j]["name"]) {
        swap(fastFoodArray, i, j)

      }
    } 
  }
  return fastFoodArray
}

/**
 * Given an array of fast food restaurants, return a new sorted
 * array ranked by the overall satisfaction.
 *
 * The satisfaction of a restaurant is the average score between
 * customerService, foodVariety, valueForMoney, timeToMake and taste.
 *
 * You do not need to round the satisfaction value.
 *
 * If two restaurants have the same satisfaction, the names
 * are compared in lexigraphical order (case-insensitive).
 * For example, "hungry Jacks" will appear before "KFC" because
 * "h" is before "K".
 *
 * WARNING: you should NOT modify the order of the original array.
 *
 * @param {
 *   Array<{
 *     name: string,
 *     customerService: number,
 *     foodVariety: number,
 *     valueForMoney: number,
 *     timeToMake: number,
 *     taste: number
 *  }>
 * } fastFoodArray with information about fast food restaurants,
 * which should not be modified.
 * @returns {
 *   Array<{
 *     restaurantName: string,
 *     satisfaction: number,
 *   }>
 * } a new sorted array based on satisfaction. The restaurantName
 * will be the same as the original name given.
 */
function sortedSatisfaction(fastFoodArray) {
  // TODO: Observe the return type from the stub code
  // FIXME: Replace the stub code with your implementation
  let ReturnArray = []
  for (var i = 0; i < fastFoodArray.length; ++i) {
    let satisfaction = (fastFoodArray[i]["customerService"] + fastFoodArray[i]["foodVariety"] + fastFoodArray[i]["valueForMoney"] + fastFoodArray[i]["timeToMake"] +fastFoodArray[i]["taste"]) / 5
    
    ReturnArray[i] = {} 
    ReturnArray[i]["restaurantName"] = fastFoodArray[i]["name"]
    ReturnArray[i]["satisfaction"] = satisfaction
  }

  for (var i = 0; i < ReturnArray.length; ++i) {
    for (var j = i + 1; j < ReturnArray.length; ++j) {
      if (ReturnArray[i]["satisfaction"] < ReturnArray[j]["satisfaction"]) {
        swap(ReturnArray, i, j)
      } else if (ReturnArray[i]["satisfaction"] == ReturnArray[j]["satisfaction"]
      && ReturnArray[i]["restaurantName"] > ReturnArray[j]["restaurantName"]) {
        swap(ReturnArray, i, j)
      }
    } 
  }
  return ReturnArray
}

// ========================================================================= //

/**
 * Execute the file with:
 *     $ node satisfaction.js
 *
 * Feel free to modify the code below to test your functions.
 */

// Note: do not use this "fastFoods" global variable directly in your function.
// Your function has the parameter "fastFoodArray".
const fastFoods = [
  {
    name: 'Second fastFood, third satisfaction (4.6)',
    customerService: 5,
    foodVariety: 5,
    valueForMoney: 5,
    timeToMake: 4,
    taste: 4,
  },
  {
    // Same as above, but name starts with "f"
    // which is before "S" (case-insensitive)
    name: 'First fastFood, second satisfaction (4.6)',
    customerService: 5,
    foodVariety: 5,
    valueForMoney: 5,
    timeToMake: 4,
    taste: 4
  },
  {
    // Worse foodVariety, but better overall
    name: 'Third fastFood, first satisfaction (4.8)',
    customerService: 5,
    foodVariety: 4,
    valueForMoney: 5,
    timeToMake: 5,
    taste: 5
  },
];

// Note: We are using console.log because arrays cannot be commpared with ===.
// There are better ways to test which we will explore in future weeks :).
console.log('========================');
console.log('1. Testing Fast Food');
console.log('===========');
console.log(sortedFastFood(fastFoods));
console.log();

console.log('========================');
console.log('2. Testing Satisfaction');
console.log('===========');
console.log(sortedSatisfaction(fastFoods));
console.log();
