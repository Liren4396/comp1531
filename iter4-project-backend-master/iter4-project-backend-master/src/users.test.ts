import { requestAuthRegister, requestClear, requestUserProfile, requestUserProfileSetname, requestSetHandle, requestUserProfileSetemail, requestUsersAll, requestUploadPhoto } from './FunctionForTest';

beforeEach(() => {
  requestClear();
});
/*
afterAll(() => {
  requestClear();
});
*/
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /user/profile/sethandle/v1         ////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
test('set handle empty data', () => {
  expect(requestSetHandle('123456', 'a1234')).toStrictEqual(400);
});
describe('Unit tests for /user/profile/sethandle/v1', () => {
  let token, handleStr;
  beforeEach(() => {
    const user = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
    const profile = requestUserProfile(user.token, user.authUserId);
    handleStr = profile.user.handleStr;

    token = user.token;
  });

  // 400 case
  test('handleStr less than 3 characters', () => {
    expect(requestSetHandle(token, 'a')).toStrictEqual(400);
  });
  test('handleStr more than 30 character', () => {
    expect(requestSetHandle(token, 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopars')).toStrictEqual(400);
  });
  test('handleStr contains non alphanumeric', () => {
    expect(requestSetHandle(token, 'a1234@b567c890#')).toStrictEqual(400);
  });
  test('handleStr already in use', () => {
    expect(requestSetHandle(token, handleStr)).toStrictEqual(400);
  });
  test('token invalid', () => {
    expect(requestSetHandle(token + 1, 'jimbobby')).toStrictEqual(403);
  });

  // Correct output
  test('Correct Output', () => {
    expect(requestSetHandle(token, 'jimbobby')).toStrictEqual({});
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////                 Tests For /users/all/v1                ////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
test('usersAll empty data', () => {
  expect(requestUsersAll('123456')).toStrictEqual(403);
});
describe('Test: /users/all/v1', () => {
  let token, userId1;
  beforeEach(() => {
    const user = requestAuthRegister('test1@gmail.com', 'password12345', 'jim', 'bob');
    token = user.token;
    userId1 = user.authUserId;
  });

  // 400 Case
  test('token invalid', () => {
    expect(requestUsersAll(token + 1)).toStrictEqual(403);
  });

  // // Valid Case
  test('valid test: one input', () => {
    expect(requestUsersAll(token)).toStrictEqual(
      {
        users: [{
          uId: userId1,
          email: 'test1@gmail.com',
          nameFirst: 'jim',
          nameLast: 'bob',
          handleStr: 'jimbob',
          profileImgUrl: expect.any(String),
        }]
      });
  });

  test('valid test: two inputs', () => {
    const user2 = requestAuthRegister('test2@gmail.com', 'password54321', 'Jhon', 'Biden');
    const userId2 = user2.authUserId;
    expect(requestUsersAll(token)).toStrictEqual(
      {
        users: [{
          uId: userId1,
          email: 'test1@gmail.com',
          nameFirst: 'jim',
          nameLast: 'bob',
          handleStr: 'jimbob',
          profileImgUrl: expect.any(String),
        },
        {
          uId: userId2,
          email: 'test2@gmail.com',
          nameFirst: 'Jhon',
          nameLast: 'Biden',
          handleStr: 'jhonbiden',
          profileImgUrl: expect.any(String),
        }]
      });
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /user/profile/setemail/v1          ////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
test('set email empty data', () => {
  expect(requestUserProfileSetemail('123456', 'user@')).toStrictEqual(400);
});
describe('Test: /user/profile/setemail/v1', () => {
  let token, uId;
  beforeEach(() => {
    const user = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
    token = user.token;
    uId = user.authUserId;
  });

  // 400 case
  test('invalid name', () => {
    expect(requestUserProfileSetemail(token, 'user@')).toStrictEqual(400);
  });
  test('email is used already', () => {
    expect(requestUserProfileSetemail(token, 'test1@gmail.com')).toStrictEqual(400);
  });
  test('invalid token', () => {
    expect(requestUserProfileSetemail(token + 1, 'test2@gmail.com')).toStrictEqual(403);
  });

  // Valid Case
  test('valid case', () => {
    expect(requestUserProfileSetemail(token, 'test2@gmail.com')).toStrictEqual({});
    expect(requestUsersAll(token)).toStrictEqual(
      {
        users: [
          {
            uId: uId,
            email: 'test2@gmail.com',
            nameFirst: 'jim',
            nameLast: 'bob',
            handleStr: 'jimbob',
            profileImgUrl: expect.any(String),
          }
        ]
      }
    );
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /user/profile/setname/v1           ////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
test('set name empty data', () => {
  expect(requestUserProfileSetname('123456', 'llljfadis', 'fdsajlk')).toStrictEqual(400);
});
describe('Tests for /user/profile/setname/v1', () => {
  // QUESTIONS:
  // 1) can the user keep the same name but change the other?
  // 2)

  let User1, firstName, lastName;
  beforeEach(() => {
    // Create 1 user
    firstName = 'Person1';
    lastName = 'Person1LastName';
    User1 = requestAuthRegister('test1@gmail.com', 'password', firstName, lastName);
  });

  // 400 case 1 - length of nameFirst is not between 1 and 50 characters inclusive
  // 400 case 1.1 - length of nameFirst is not less than 1 characters
  test('length of nameFirst is not less than 1 characters', () => {
    const shortName = '';
    expect(requestUserProfileSetname(User1.token, shortName, lastName)).toStrictEqual(400);
  });

  // 400 case 1.2 - length of nameFirst is not greather than 50 characters
  test('length of nameFirst is not greater than 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(requestUserProfileSetname(User1.token, firstName, longName)).toStrictEqual(400);
  });

  // 400 case 2 - length of nameLast is not between 1 and 50 characters inclusive
  // 400 case 2.1 - length of nameLast is not less than 1 characters
  test('length of nameLast is not less than 1 characters', () => {
    const shortSurname = '';
    expect(requestUserProfileSetname(User1.token, firstName, shortSurname)).toStrictEqual(400);
  });

  // 400 case 2.2 - length of nameLast is not greater than 50 characters
  // 400 case 1.2 - length of nameFirst is not greather than 50 characters
  test('length of nameFirst is not greather than 50 characters', () => {
    const longSurname = 'a'.repeat(51);
    expect(requestUserProfileSetname(User1.token, firstName, longSurname)).toStrictEqual(400);
  });

  // 400 case 3 - token is invalid
  test('invalid token', () => {
    expect(requestUserProfileSetname(User1.token + 1, firstName, lastName)).toStrictEqual(403);
  });

  // 400 case 3 - token is invalid
  test('invalid token', () => {
    expect(requestUserProfileSetname(User1.token + 1, firstName, lastName)).toStrictEqual(403);
  });

  // VALID CASES
  // WAITING FOR /users/all/v1
  test('Valid input', () => {
    const ret1 = requestUsersAll(User1.token);

    // Returns a list of all users and their associated details.
    expect(ret1).toStrictEqual({
      users: [{
        uId: User1.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'Person1',
        nameLast: 'Person1LastName',
        handleStr: 'person1person1lastna',
        profileImgUrl: expect.any(String),

      }]
    });

    const ret2 = requestUserProfileSetname(User1.token, 'NewFirst', 'NewLast');
    expect(ret2).toStrictEqual({});

    const ret3 = requestUsersAll(User1.token);
    expect(ret3).toStrictEqual({
      users: [{
        uId: User1.authUserId,
        email: 'test1@gmail.com',
        nameFirst: 'NewFirst',
        nameLast: 'NewLast',
        handleStr: 'person1person1lastna',
        profileImgUrl: expect.any(String),
      }]
    });
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For userProfileV1             /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('userProfileV1 empty data', () => {
  expect(requestUserProfile('123456', 1)).toStrictEqual(400);
});
describe('Test successful -- userProfileV1 -- one person', () => {
  test('Test successful -- userProfileV1 -- one person', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(requestUserProfile(person1.token, person1.authUserId)).toStrictEqual({

      user: {
        uId: person1.authUserId,
        email: 'z5369144@ad.unsw.edu.au',
        nameFirst: 'Liren',
        nameLast: 'Ding',
        handleStr: 'lirending',
        profileImgUrl: expect.any(String)
      }
    });
  });
});

describe('Test successful -- userProfileV1 -- more person', () => {
  test('Test successful -- userProfileV1 -- one person', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');

    expect(requestUserProfile(person1.token, person1.authUserId)).toStrictEqual({
      user: {
        uId: person1.authUserId,
        email: 'z5369144@ad.unsw.edu.au',
        nameFirst: 'Liren',
        nameLast: 'Ding',
        handleStr: 'lirending',
        profileImgUrl: expect.any(String)
      }
    });
  });
});

test('Test fail-- userProfileV1 -- No register', () => {
  const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
  expect(requestUserProfile('', person1.authUserId + 1)).toStrictEqual(403);
  expect(requestUserProfile(person1.token, person1.authUserId + 1)).toStrictEqual(400);
});

test('Test from course test ', () => {
  const authID = requestAuthRegister('test@email.com', 'password', 'bob', 'john');
  const uID = requestAuthRegister('blah@email.com', 'password1', 'john', 'smith');
  const res = requestUserProfile(authID.token, uID.authUserId);
  expect(res).toStrictEqual({ user: { uId: uID.authUserId, email: 'blah@email.com', nameFirst: 'john', nameLast: 'smith', handleStr: 'johnsmith', profileImgUrl: expect.any(String) } });
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For user/profile/uploadphoto/v1            /////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('uploadPhoto empty data', () => {
  expect(requestUploadPhoto('1232456', '123456', 5, 5, 90, 90)).toStrictEqual(400);
});
describe('Test for user/profile/uploadphoto/v1', () => {
  let user, imgUrl;
  beforeEach(() => {
    user = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
    imgUrl = 'http://www.freeimageslive.com/galleries/objects/general/pics/woodenbox0483.jpg';
  });
  // Error case
  // 400
  test('Invalid Token', () => {
    expect(requestUploadPhoto(user.token + 1, imgUrl, 5, 5, 90, 90)).toStrictEqual(400);
  });
  test('imgUrl returns an HTTP status other than 200, or any other errors occur when attempting to retrieve the image', () => {
    expect(requestUploadPhoto(user.token, 'asdflkjaslkd.com', 1, 2, 3, 4)).toStrictEqual(400);
  });
  test('xStart not in dimension', () => {
    expect(requestUploadPhoto(user.token, imgUrl, -2, 5, 90, 90)).toStrictEqual(400);
  });
  test('yStart not in dimension', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, -2, 90, 90)).toStrictEqual(400);
  });
  test('xEnd not in dimension', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, 5, 10000, 90)).toStrictEqual(400);
  });
  test('xEnd not in dimension', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, 5, 90, 10000)).toStrictEqual(400);
  });
  test('xEnd is less than or equal to xStart or', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, 5, 5, 5)).toStrictEqual(400);
  });
  test('yEnd is less than or equal to yStart', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, 5, 5, 5)).toStrictEqual(400);
  });
  test('image uploaded is not a JPG', () => {
    const png = 'https://e7.pngegg.com/pngimages/862/158/png-clipart-shrek-shrek-film-series-princess-fiona-shrek-heroes-fictional-character.png';
    expect(requestUploadPhoto(user.token, png, 5, 5, 90, 90)).toStrictEqual(400);
  });
  test('test failed img url', () => {
    const img = 'http://unswmemes-production.up.railway.app/images/default1.jpg';
    expect(requestUploadPhoto(user.token, img, 5, 5, 90, 90)).toStrictEqual(400);
  });
  test('test correct img url', () => {
    const img = 'https://s1.zerochan.net/Yuuki.Asuna.600.3440883.jpg';
    expect(requestUploadPhoto(user.token, img, 5, 5, 90, 90)).toStrictEqual({});
  });
  // Correct case
  test('Correct', () => {
    expect(requestUploadPhoto(user.token, imgUrl, 5, 5, 1000, 1000)).toStrictEqual({});
  });
});
