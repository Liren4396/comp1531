/**
 * @module academics
 */

/**
 * Create your dataStore here. The design is entirely up to you!
 * One possible starting point is
 *
 * let/const dataStore = {
 *   academics: [],
 *   courses: []
 * }
 *
 * and adding to the dataStore the necessary information when the
 * "create" functions are used.
 *
 * You will also need to modify the clear function accordingly
 * - we recommend you complete clear() at the bottom first!
 * 
 * Do not export the dataStore. Your tests should not use/rely on
 * how dataStore is structured - only what goes in and out of the
 * defined functions from the interface.
 */

// TODO

/**
 * Complete the functions from the interface table.
 * As an optional activity, you can document your functions
 * similar to how academicCreate has been done.
 *
 * A reminder to return { error: 'any relevant error message of your choice' }
 * for error cases.
 */

/**
 * Creates a new academic, returning an object containing
 * a unique academic id
 *
 * @param {string} name
 * @param {string} hobby
 * @returns {{academicId: number}}
 */

let academic = [];
let count_academicId = 1;
let course = [];
let count_courseId = 1;

export function academicCreate(name, hobby) {
  if (name == '' || hobby == '') {
    return { error: 'a relevant error message of your choice.' };
  } else {
    let newobj = [];
    newobj['academicId'] = count_academicId;
    newobj['name'] = name;
    newobj['hobby'] = hobby;
    newobj['in_course'] = [];

    academic.push(newobj);
    ++count_academicId;
    return {academicId : count_academicId - 1};

  }
  
}



function checkname(string) {

  if (string.length == 8 && string[0] <= 'Z' && string[0] >= 'A'
  && string[1] <= 'Z' && string[1] >= 'A'
  && string[2] <= 'Z' && string[2] >= 'A'
  && string[3] <= 'Z' && string[3] >= 'A'
  && string[4] <= '9' && string[4] >= '0'
  && string[5] <= '9' && string[5] >= '0'
  && string[6] <= '9' && string[6] >= '0'
  && string[7] <= '9' && string[7] >= '0') {
    return true;
  }
  return false;
}


/**
 * Some description
 *
 * @param {number} academicId
 * @param {string} name
 * @param {string} description
 * @returns {{courseId: number}}
 */
export function courseCreate(academicId, name, description) {
  if (academicId < 1 || academicId >= count_academicId || checkname(name) == false) {
    return { error: 'a relevant error message of your choice.' };
  } else {
    let newobj = [];
    newobj['courseId'] = count_courseId;
    newobj['academicId'] = academicId;
    newobj['name'] = name;
    newobj['description'] = description;
    course.push(newobj);
    ++count_courseId;
    return {
      courseId: count_courseId - 1,
    };
  }
  
}

/**
 * Some documentation
 */
export function academicDetails(academicId, academicToViewId) {
  if (academicId < 1 || academicId >= count_academicId 
  || academicToViewId < 1 || academicToViewId >= count_academicId) {
    return { error: 'a relevant error message of your choice.' };
  } else {
    //console.log(academic);
    //let academicObj;

    for (let i of academic) {
      //console.log(i);
      if (i.academicId == academicToViewId) {

        //academicObj = academic[i];
        return {
          academic: {
            academicId: i.academicId,
            name: i.name,
            hobby: i.hobby,
          }
        }
      }
    }
    
  }
}


export function courseDetails(academicId, courseId) {
  if (academicId < 1 || academicId >= count_academicId 
  || courseId < 1 || courseId >= count_courseId) {
    return { error: 'a relevant error message of your choice.' };
  } else {
    //console.log(course);
    //console.log(academic);
    let returnob = {};
    for (let i of course) {
      if (i.courseId == courseId) {
        
        returnob['courseId'] = i.courseId;
        returnob['name'] = i.name;
        returnob['description'] = i.description;
        break;
      }
    }

    let flag = 0; 
    for (let i of academic) {
      if (i.academicId == academicId) {
        for (let j of i.in_course) {
          if (j.course == courseId && j.isMember == true) {
            flag = 1;
          }
        }
        if (flag == 0) {
          return { error: 'a relevant error message of your choice.' };
        }
        
      }
    }
    
    returnob['staffMembers'] = [];
    returnob['allMembers'] = [];
    for (let i of academic) {
      for (let j in i.in_course) {
        if (i.in_course[j].course == courseId) {
          let student = {};
          student['academicId'] = i.academicId;
          student['name'] = i.name;
          student['hobby'] = i.hobby;

          
          //console.log(returnob);
          if (i.in_course[j].isStaff == true) {
            returnob['staffMembers'].push(student);
          }
          if (i.in_course[j].isMember == true) {
            returnob['allMembers'].push(student);
          }
          console.log(returnob);
        }
      }
      
    }
    return {course : returnob};
  }
  
}

export function academicsList(academicId) {
  if (academicId < 1 || academicId >= count_academicId) {
    return { error: 'a relevant error message of your choice.' };
  } else {
    let returnvalue = [];
    for (let i of academic) {
      //console.log(i);

      returnvalue.push({
        academicId: i.academicId,
        academicName: i.name,
      });
      

    }
    return {academics : returnvalue};
  }
  
}

export function coursesList(academicId) {
  if (academicId < 1 || academicId >= count_academicId) {
    return { error: 'a relevant error message of your choice.' };
  } else {
    let returnvalue = [];
    for (let i of course) {
      //console.log(i);
      let new_return = {};
      new_return['courseId'] = i.courseId;
      new_return['courseName'] = i.name;
      returnvalue.push(new_return);
    }
    return {course : returnvalue};
  }
}



export function courseEnrol(academicId, courseId, isStaff) {
  if (academicId < 1 || academicId >= count_academicId 
  || courseId < 1 || courseId >= count_courseId) {
    return { error: 'a relevant error message of your choice.' };
  } else {

    for (let i of academic) {
      if (i.academicId == academicId) {
        if (i.in_course.length == 0) {
          ;
        } else {
          for (let j of i.in_course) {
            if (j['course'] == courseId && j['isMember'] == true) {
              return { error: 'a relevant error message of your choice.' };
            }
          }
          
        }
        let new_course = {};
        new_course['isStaff'] = isStaff;
        new_course['isMember'] = true;
        new_course['course'] = courseId;
        //i['in_course'].push(new_course);
        for (let position = 0; position < academic.length; ++position) {
          if (academic[position] == i) {

            academic[position].in_course.push(new_course);
            //console.log(new_course);
            //console.log(academic);

            break;
          }
        }
        
      }
    }
    
  }
  return {};
}

export function clear() {
  // TODO
  count_academicId = 1;
  count_courseId = 1;
  academic = [];
  course = [];
  return {};
}
