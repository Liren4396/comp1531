/**
 * The dataStore below will be used in the given console.log debug statements
 * at the bottom of the file.
 * You can modify this if you want to do your own testing.
 *
 * We will be using a modified dataStore in the automarking - see the
 * "Testing" section the specification.
 */
const dataStore = {
    academics: [{
            id: 10,
            name: 'Ada',
            hobby: 'music',
        },
        {
            id: 20,
            name: 'Ben',
            hobby: 'gym',
        },
        {
            id: 30,
            name: 'Cid',
            hobby: 'chess',
        },
        {
            id: 40,
            name: 'Dan',
            hobby: 'art',
        },
        {
            id: 50,
            name: 'Eve',
            hobby: 'yoga',
        },
    ],

    courses: [{
            id: 1511,
            name: 'COMP1511',
            description: 'Programming Fundamentals',
            staffIds: [10, 20],
            memberIds: [10, 20, 30, 40, 50],
        },
        {
            id: 1521,
            name: 'COMP1521',
            description: 'Computer Systems Fundamentals',
            staffIds: [20],
            memberIds: [20, 40, 50],
        },
        {
            id: 1531,
            name: 'COMP1531',
            description: 'Software Engineering Fundamentals',
            staffIds: [20, 30],
            memberIds: [20, 30, 10, 40],
        },
    ],
};

/**
 * @returns {{numAcademics: number}} object
 */
function getNumAcademics() {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0;
    for (i; i < dataStore.academics.length; ++i) {;
    }
    return {
        numAcademics: i,
    };
}

/**
 * @returns {{numCourses: number}}
 */
function getNumCourses() {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0;
    for (; i < dataStore.courses.length; ++i) {;
    }
    return {
        numCourses: i,
    };
}

/**
 * @param {number} academicId - unique identifier for an academic.
 * @returns {{academic: {name: string, hobby: string}}}
 * @returns {{error: string}} on error
 */
function getAcademicDetailsFromId(academicId) {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0
    for (; i < dataStore.academics.length; ++i) {
        if (dataStore.academics[i].id == academicId) {
            break;
        }
    }
    if (i == dataStore.academics.length) {
        return { error: 'any string value' };
    } else {
        return {
            academic: {
                name: dataStore.academics[i].name,
                hobby: dataStore.academics[i].hobby,
            },
        };
    }

}

/**
 * @param {number} courseId - unique identifier for a course.
 * @returns {{course: {name: string, description: string}}}
 * @returns {{error: string}} on error
 */
function getCourseDetailsFromId(courseId) {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0;
    for (; i < dataStore.courses.length; ++i) {
        if (dataStore.courses[i].id == courseId) {
            break;
        }
    }
    if (i == dataStore.courses.length) {
        return { error: 'any string value' };
    } else {
        return {
            course: {
                name: dataStore.courses[i].name,
                description: dataStore.courses[i].description,
            },
        };
    }

}

/**
 * @param {number} academicId - unique indentifier for an academic
 * @param {number} courseId - unique identifier for a course
 * @returns {{isMember: boolean}}
 * @returns {{error: string}} on error
 */
function checkAcademicIsMember(academicId, courseId) {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0;
    for (; i < dataStore.courses.length; ++i) {
        if (courseId == dataStore.courses[i].id) {
            break;
        }
    }
    if (i == dataStore.courses.length) {
        return { error: 'any string value' };
    } else {
        var course_find = i;
        for (i = 0; i < dataStore.courses[course_find].memberIds.length; ++i) {
            if (dataStore.courses[course_find].memberIds[i] == academicId) {
                return { isMember: true };
            }
        }
        return { error: 'any string value' };
    }

}

/**
 * @param {number} academicId - unique indentifier for an academic
 * @param {number} courseId - unique identifier for a course
 * @returns {{isStaff: Boolean}}
 * @returns {{error: string}} on error
 */
function checkAcademicIsStaff(academicId, courseId) {
    // TODO: Observe the return object, then replace with your implementation
    // to work on dataStores with a different number of academics and courses.
    var i = 0;
    for (; i < dataStore.courses.length; ++i) {
        if (courseId == dataStore.courses[i].id) {
            break;
        }
    }
    if (i == dataStore.courses.length) {
        return { error: 'any string value' };
    } else {
        var course_find = i;
        for (i = 0; i < dataStore.courses[course_find].staffIds.length; ++i) {
            if (dataStore.courses[course_find].staffIds[i] == academicId) {
                return { isStaff: true };
            }
        }
        return { error: 'any string value' };
    }
}

/**
 * You will not be able to compare two objects with `===`. For this week, you
 * can simply console.log() the output and view it manually.
 *
 * NOTE: the output of any console.log statements, e.g. colours/whitespaces
 * does not matter when we mark your code, as we will be assessing the
 * return value of your functions directly.
 */
console.log('1. numAcademics()');
console.log('Expect: { numAcademics: 5 }');
console.log('Output:', getNumAcademics());
console.log();

console.log('2. numCourses()');
console.log('Expect: { numCourses: 3 }');
console.log('Output:', getNumCourses());
console.log();

console.log('3. getAcademicDetailsFromId(10)');
console.log("Expect: { academic: { name: 'Ada', hobby: 'music' } }");
console.log('Output:', getAcademicDetailsFromId(10));
console.log();

console.log('4. getAcademicDetailsFromId(999999)');
console.log("Expect: { error: 'any string value' }");
console.log('Output:', getAcademicDetailsFromId(999999));
console.log();


console.log('checkAcademicIsMember(10, 1511)');
console.log("Expect: { isMember: true }");
console.log('Output:', checkAcademicIsMember(10, 1511));
console.log();


console.log('checkAcademicIsMember(10, 1511)');
console.log("Expect: { error: 'any string value' }");
console.log('Output:', checkAcademicIsMember());
console.log();


console.log('checkAcademicIsStaff(10, 1511)');
console.log("Expect: { isStaff: true }");
console.log('Output:', checkAcademicIsStaff(10, 1511));
console.log();

console.log('// TODO: You can add more debugging console.log here.');