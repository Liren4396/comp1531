/**
 * NOTE: The only functions that you should write tests for are those defined
 * in the specification's interface (README.md). 
 * 
 * Your dataStore or any "helper" function you define should NOT be imported or
 * tested - your tests must work even if it is run against another student's
 * solution to this lab.
 */

import {
  academicCreate,
  courseCreate,
  academicDetails,
  courseDetails,
  academicsList,
  coursesList,
  courseEnrol,
  clear,
} from './academics';





const ERROR = { error: expect.any(String) };

// It is important to clear the data store so that no tests will rely on the result of another.
// This beforeEach will run before every test in this test suite!
// This saves us from having to repeatedly clear the data store every time we start a new, independent test
// See [Jest's Setup and Teardown](https://jestjs.io/docs/setup-teardown) for more information
beforeEach(() => {
  clear();
});

// FIXME
// This is a sample test that tests many academic functions together
// You may want to break this up into multiple tests.
describe('Sample test', () => {
  test('error creating academics, empty name', () => {
    expect(academicCreate('', 'dancing')).toStrictEqual({ error: expect.any(String) });
  });

  test('correct return type', ()=> {
    const academic = academicCreate('Magnus', 'chess');

    // NOTE: We don't actually know what the generated ID should be
    expect(academic).toStrictEqual(
      {
        academicId: expect.any(Number),
      }
    );

    // However, we can still use this ID in other functions
    expect(academicDetails(academic.academicId, academic.academicId)).toStrictEqual({
      academic: {
        academicId: academic.academicId,
        name: 'Magnus',
        hobby: 'chess',
      }
    });

    // Note the different key for "name" in this function - refer to "Data Types"
    // When comparing arrays with multiple items, you may want to convert each
    // array into a Set (since we don't know which order the items will be in).
    expect(academicsList(academic.academicId)).toStrictEqual({
      academics: [
        {
          academicId: academic.academicId,
          academicName: 'Magnus',
        }
      ]
    });
  });
});

// Below are further test blocks that we have started for you.
// Feel free to modify them or move them to different test files/directories if needed!
describe('clear', () => {
  test('returns empty dictionary', () => {
    expect(clear()).toStrictEqual({});
  });
  
  // TODO: More tests for clear
});

describe('academicCreate', () => {
  test.each([
    { name: '', hobby: 'dancing' },
    { name: 'Jade', hobby: '' },
  ])("error: ('$name', '$hobby')", ({ name, hobby }) => {
    expect(academicCreate(name, hobby)).toStrictEqual(ERROR);
  });

  // TODO: More tests for academicCreate


  test('correct return type', ()=> {
    const academic1 = academicCreate('Magnus', 'chess');
    const academic2 = academicCreate('Kirito', 'SAO');
    const academic3 = academicCreate('Asuna', 'SAO');

    const academic = [];
    academic.push(academic1);
    academic.push(academic2);
    academic.push(academic3);

    const course1 = courseCreate(academic.academicId, 'COMP2041', 'Shell and Python3');
    const course2 = courseCreate(academic.academicId, 'COMP1531', 'JavaScript');

    //console.log(academic);
    //console.log(course1);
    //console.log(course2);
    // NOTE: We don't actually know what the generated ID should be
    expect(course1).toStrictEqual(
      {
        courseId: expect.any(Number),
      }
    );
    expect(courseEnrol(1, 1, true)).toStrictEqual(
      {
      }
    );
    expect(courseEnrol(2, 2, true)).toStrictEqual(
      {
      }
    );
    expect(courseEnrol(3, 2, false)).toStrictEqual(
      {
      }
    );
    // However, we can still use this ID in other functions
    expect(courseDetails(1, 1)).toStrictEqual({
      course: {
        courseId: 1,
        name: 'COMP2041',
        description: 'Shell and Python3',
        staffMembers: [
          {
            academicId: 1,
            name: 'Magnus',
            hobby: 'chess',
          },
        ],
        allMembers: [
          {
            academicId: 1,
            name: 'Magnus',
            hobby: 'chess',
          },
        ],
      }
  
    });    
    expect(courseDetails(2, 2)).toStrictEqual({
      course: {
        courseId: 2,
        name: 'COMP1531',
        description: 'JavaScript',
        staffMembers: [
          {
            academicId: 2,
            name: 'Kirito',
            hobby: 'SAO',
          },
        ],
        allMembers: [
          {
            academicId: 2,
            name: 'Kirito',
            hobby: 'SAO',
          },
          {
            academicId: 3,
            name: 'Asuna',
            hobby: 'SAO',
          },
        ],
      }
  
    });

    // Note the different key for "name" in this function - refer to "Data Types"
    // When comparing arrays with multiple items, you may want to convert each
    // array into a Set (since we don't know which order the items will be in).
    expect(coursesList(1)).toStrictEqual({
      course: [
        {
          courseId: 1,
          courseName: 'COMP2041',
        },
        {
          courseId: 2,
          courseName: 'COMP1531',
        },
      ]
    });
  });
});

describe('courseCreate', () => {
  test.each([
    { name: '' },
    { name: 'COMP204L' },
    { name: '2041COMP' },
    { name: 'COMP204' },
    { name: 'COMP20411' },
    { name: 'CCOMP2041' },
    { name: 'comp2041' },
  ])("invalid course name: '$name'", ({ name }) => {
    const academic = academicCreate('Lina', 'Karaoke');
    expect(courseCreate(academic.academicId, name, '')).toStrictEqual(ERROR);
  });
  
  // TODO: more tests for courseCreate
});

describe('academicDetails', () => {
  // We can also use beforeEach inside of describe blocks.
  // This will only run before the tests written inside this describe block. Note that this
  // 'beforeEach' will run after the 'beforeEach' that we've written at the top of the file,
  // so it isn't necessary to call the 'clear' function again here.
  let academic;
  beforeEach(() => {
    academic = academicCreate('Tamantha', 'Running')
  });
  
  test('invalid authId', () => {
    expect(academicDetails(academic.academicId + 1, academic.academicId)).toStrictEqual(ERROR);
  });
  
  test('invalid viewId', () => {
    expect(academicDetails(academic.academicId, academic.academicId + 1)).toStrictEqual(ERROR);
  });

  test('view self details', () => {
    expect(academicDetails(academic.academicId, academic.academicId)).toStrictEqual({
      academic: {
        academicId: academic.academicId,
        name: 'Tamantha',
        hobby: 'Running',
      }
    });
  });

  test("view other academics' details", () => {
    const academic2 = academicCreate('applelover', 'eating');
    expect(academicDetails(academic.academicId, academic2.academicId)).toStrictEqual({
      academic: {
        academicId: academic2.academicId,
        name: 'applelover',
        hobby: 'eating',
      }
    });
    expect(academicDetails(academic2.academicId, academic.academicId)).toStrictEqual({
      academic: {
        academicId: academic.academicId,
        name: 'Tamantha',
        hobby: 'Running',
      }
    });
  });
});

describe('courseDetails', () => {
  // TODO
});

describe('academicsList', () => {
  // TODO
});

describe('coursesList', () => {
  // TODO
});

describe('courseEnrol', () => {
  // TODO
});

