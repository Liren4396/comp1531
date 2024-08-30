import { authUserreturntype } from './interfaces';
import {
  requestAuthRegister,
  requestClear,
  requestAuthLogin,
  requestAuthLogout,
  requestUserProfile,
  requestUsersAll,
  requestAuthPasswordresetRequest,
  requestAuthPasswordresetReset,
  requestGetResetCode,
  requestAdminUserRemove
} from './FunctionForTest';
// import { requestNotificationsGet } from './notification'

beforeEach(() => {
  requestClear();
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////           Tests For requestAuthLogin          //////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('tests for authLogin', () => {
  test('valid input - lowercase email', () => {
    requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.com', 'password');
    expect(testUser1 as authUserreturntype).toStrictEqual({ authUserId: testUser1.authUserId, token: expect.any(String) });
  });

  test('valid input - uppercase email', () => {
    requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    const testUser1 = requestAuthLogin('USER1@EMAIL.COM', 'password');
    expect(testUser1 as authUserreturntype).toStrictEqual({ authUserId: testUser1.authUserId, token: expect.any(String) });
  });

  test('valid input - fancy email', () => {
    requestAuthRegister('claire.fan@unsw.edu.au', 'password', 'claire', 'fan');
    const testUser1 = requestAuthLogin('claire.fan@unsw.edu.au', 'password');
    expect(testUser1 as authUserreturntype).toStrictEqual({ authUserId: testUser1.authUserId, token: expect.any(String) });
  });

  test('valid input - fancy password', () => {
    requestAuthRegister('user1@email.com', 'Un$wf@tp@ssw0rd', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.com', 'Un$wf@tp@ssw0rd');
    expect(testUser1 as authUserreturntype).toStrictEqual({ authUserId: testUser1.authUserId, token: expect.any(String) });
  });

  test('wrong email - not registered', () => {
    const testUser1 = requestAuthLogin('user1@email.com', 'Un$wf@tp@ssw0rd');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('wrong email - invalid email', () => {
    requestAuthRegister('user1@email.com', 'Un$wf@tp@ssw0rd', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.', 'Un$wf@tp@ssw0rd');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('wrong email - mistyped', () => {
    requestAuthRegister('user1@email.com', 'Un$wf@tp@ssw0rd', 'claire', 'fan');
    const testUser1 = requestAuthLogin('userr@email.com', 'Un$wf@tp@ssw0rd');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('wrong password - mistyped', () => {
    requestAuthRegister('user1@email.com', 'Un$wf@tp@ssw0rd', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.com', 'Un$wfatpassw0rd');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('wrong password - wrong case #1', () => {
    requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.com', 'PASSWORD');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('wrong password - wrong case #2', () => {
    requestAuthRegister('user1@email.com', 'PASSWORD', 'claire', 'fan');
    const testUser1 = requestAuthLogin('user1@email.com', 'password');
    expect(testUser1 as authUserreturntype).toStrictEqual(400);
  });

  test('lots of registered users', () => {
    requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user2@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user3@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user4@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user5@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user6@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user7@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user8@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user9@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user1@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user2@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user3@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user4@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user5@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user6@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user7@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user8@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('user9@gmail.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire1@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire2@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire3@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire4@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire5@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire6@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire7@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire8@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('claire9@email.com', 'password', 'claire', 'fan');
    requestAuthRegister('user10@email.com', 'Unsw$w@g', 'claire', 'fan');
    const testUser = requestAuthLogin('user10@email.com', 'Unsw$w@g');
    expect(testUser as authUserreturntype).toStrictEqual({ authUserId: testUser.authUserId, token: expect.any(String) });
  });
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////           Tests For requestAuthRegister          /////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
test('register name > 20', () => {
  const email = 'a@qq.com';
  const password = 'password123';
  const nameFirst = 'b'.repeat(15);
  const nameLast = 'a'.repeat(10);
  const result = requestAuthRegister(email, password, nameFirst, nameLast);
  expect(result).toStrictEqual({ authUserId: result.authUserId, token: expect.any(String) });
});

describe('Testing authRegister', () => {
  // Test case 1 - Test for a valid entry
  test('Valid input, 1 entry', () => {
    const email = 'michael.lorusso@example.com';
    const password = 'password123';
    const nameFirst = 'Michael';
    const nameLast = 'LoRusso';

    const authUserId = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(authUserId as authUserreturntype).toStrictEqual({ authUserId: 1, token: expect.any(String) });
  });

  // Test case 2 - Test for a valid entry
  test('Valid input, 2 entries', () => {
    const email1 = 'michael.lorusso@example.com';
    const password1 = 'password123';
    const nameFirst1 = 'Michael';
    const nameLast1 = 'LoRusso';

    const authUserId1 = requestAuthRegister(email1, password1, nameFirst1, nameLast1);
    expect(authUserId1 as authUserreturntype).toStrictEqual({ authUserId: 1, token: expect.any(String) });

    const email2 = 'michael.lorusso2@example.com';
    const password2 = 'password1234';
    const nameFirst2 = 'Michael2';
    const nameLast2 = 'LoRusso2';

    const authUserId2 = requestAuthRegister(email2, password2, nameFirst2, nameLast2);
    expect(authUserId2 as authUserreturntype).toStrictEqual({ authUserId: 2, token: expect.any(String) });
  });

  // Test case 2 - Non valid email
  test('invalid input - email is invalid', () => {
    const email = 'invalid-email';
    const password = 'password123';
    const nameFirst = 'Michael';
    const nameLast = 'LoRusso';
    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });

  // Test case 3 - no given email
  test('invalid input - no email given', () => {
    const email = '';
    const password = 'password123';
    const nameFirst = 'Michael';
    const nameLast = 'LoRusso';
    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });

  // Test case 4 - Email is already taken
  test('invalid input - email is already', () => {
    const email01 = 'michael.lorusso@example.com';
    const password01 = 'password123';
    const nameFirst01 = 'Michael';
    const nameLast01 = 'LoRusso';
    requestAuthRegister(email01, password01, nameFirst01, nameLast01);

    const email02 = 'michael.lorusso@example.com';
    const password02 = 'password123';
    const nameFirst02 = 'Michael';
    const nameLast02 = 'LoRusso';
    const result02 = requestAuthRegister(email02, password02, nameFirst02, nameLast02);

    expect(result02 as authUserreturntype).toEqual(400);
  });

  // Test case 5 - short password
  test('invalid input - password too short', () => {
    const email = 'michael.lorusso@example.com';
    const password = '12345';
    const nameFirst = 'Michael';
    const nameLast = 'LoRusso';
    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });
  // Test case 6 - length of nameFirst is not between 1 and 50 characters inclusive
  test('invalid input - firstname is too short', () => {
    const email = 'michael.lorusso@example.com';
    const password = 'password123';
    const nameFirst = '';
    const nameLast = 'LoRusso';

    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });

  // Test case 7 - length of nameFirst is not between 1 and 50 characters inclusive
  test('invalid input - firstname is too long', () => {
    const email = 'michael.lorusso@example.com';
    const password = 'password123';
    const nameFirst = 'a'.repeat(51);
    const nameLast = 'LoRusso';
    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });

  // Test case 8 - length of nameLast is not between 1 and 50 characters inclusive
  test('should return an 400 when the last name is too short', () => {
    const email = 'michael.lorusso@example.com';
    const password = 'password123';
    const nameFirst = 'Michael';
    const nameLast = '';
    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });

  // Test case 9 - length of nameLast is not between 1 and 50 characters inclusive
  test('should return an 400 when the last name is too long', () => {
    const email = 'michael.lorusso@example.com';
    const password = 'password123';
    const nameFirst = 'Michael';
    const nameLast = 'a'.repeat(51);

    const result = requestAuthRegister(email, password, nameFirst, nameLast);
    expect(result as authUserreturntype).toEqual(400);
  });
});

test('handlestr test', () => {
  const email = 'michael.lorusso@example.com';
  const password = 'password123';
  const nameFirst = 'Michael';
  const nameLast = 'LoRusso';

  const result1 = requestAuthRegister(email, password, nameFirst, nameLast);
  const result2 = requestAuthRegister('michael.lorusso@example1.com', password, nameFirst, nameLast);
  const result3 = requestAuthRegister('michael.lorusso@example2.com', password, nameFirst, nameLast);
  const result4 = requestAuthRegister('michael.lorusso@example3.com', password, nameFirst, nameLast);
  const result5 = requestAuthRegister('michael.lorusso@example4.com', password, nameFirst, nameLast);
  const result6 = requestAuthRegister('michael.lorusso@example5.com', password, nameFirst, nameLast);
  const result7 = requestAuthRegister('michael.lorusso@example6.com', password, nameFirst, nameLast);
  const result8 = requestAuthRegister('michael.lorusso@example7.com', password, nameFirst, nameLast);
  const result9 = requestAuthRegister('michael.lorusso@example8.com', password, nameFirst, nameLast);
  const result10 = requestAuthRegister('michael.lorusso@example9.com', password, nameFirst, nameLast);
  const result11 = requestAuthRegister('michael.lorusso@example10.com', password, nameFirst, nameLast);
  const result12 = requestAuthRegister('michael.lorusso@example11.com', password, nameFirst, nameLast);
  const result13 = requestAuthRegister('michael.lorusso@example12.com', password, nameFirst, nameLast);
  // console.log(requestUserProfile(result1.authUserId, result1.authUserId));
  // console.log(requestUserProfile(result2.authUserId, result2.authUserId));
  expect(requestUserProfile(result1.token, result1.authUserId)).toStrictEqual({
    user: {
      uId: result1.authUserId,
      email: 'michael.lorusso@example.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result2.token, result2.authUserId)).toStrictEqual({
    user: {
      uId: result2.authUserId,
      email: 'michael.lorusso@example1.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso0',
      profileImgUrl: expect.any(String)
    }
  });
  expect(requestUserProfile(result3.token, result3.authUserId)).toStrictEqual({
    user: {
      uId: result3.authUserId,
      email: 'michael.lorusso@example2.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso1',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result4.token, result4.authUserId)).toStrictEqual({
    user: {
      uId: result4.authUserId,
      email: 'michael.lorusso@example3.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso2',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result5.token, result5.authUserId)).toStrictEqual({
    user: {
      uId: result5.authUserId,
      email: 'michael.lorusso@example4.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso3',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result6.token, result6.authUserId)).toStrictEqual({
    user: {
      uId: result6.authUserId,
      email: 'michael.lorusso@example5.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso4',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result7.token, result7.authUserId)).toStrictEqual({
    user: {
      uId: result7.authUserId,
      email: 'michael.lorusso@example6.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso5',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result8.token, result8.authUserId)).toStrictEqual({
    user: {
      uId: result8.authUserId,
      email: 'michael.lorusso@example7.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso6',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result9.token, result9.authUserId)).toStrictEqual({
    user: {
      uId: result9.authUserId,
      email: 'michael.lorusso@example8.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso7',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result10.token, result10.authUserId)).toStrictEqual({
    user: {
      uId: result10.authUserId,
      email: 'michael.lorusso@example9.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso8',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result11.token, result11.authUserId)).toStrictEqual({
    user: {
      uId: result11.authUserId,
      email: 'michael.lorusso@example10.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso9',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result12.token, result12.authUserId)).toStrictEqual({
    user: {
      uId: result12.authUserId,
      email: 'michael.lorusso@example11.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso10',
      profileImgUrl: expect.any(String)

    }
  });
  expect(requestUserProfile(result13.token, result13.authUserId)).toStrictEqual({
    user: {
      uId: result13.authUserId,
      email: 'michael.lorusso@example12.com',
      nameFirst: 'Michael',
      nameLast: 'LoRusso',
      handleStr: 'michaellorusso11',
      profileImgUrl: expect.any(String)

    }
  });
});

test('sample test', () => {
  const email = 'michael.lorusso@example.com';
  const password = 'password123';
  const nameFirst = 'Michael';
  const nameLast = 'LoRusso';
  requestAuthRegister(email, password, nameFirst, nameLast);
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////           Tests For /auth/logout/v1          //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('tests for /auth/logout/v1', () => {
  let user;
  beforeEach(() => {
    user = requestAuthRegister('test@gmail.com', 'password', 'sponge', 'bob');
  });

  test('invalid token', () => {
    expect(requestAuthLogout(user.token + '1')).toStrictEqual(403);
  });

  test('user with more than one session logs out one session', () => {
    requestAuthLogin('test@gmail.com', 'password');
    expect(requestAuthLogout(user.token)).toStrictEqual({});
  });

  test('user with more than one session logs out one session', () => {
    const user1 = requestAuthLogin('test@gmail.com', 'password');
    expect(requestAuthLogout(user1.token)).toStrictEqual({});
  });

  test('user with more than one sessions logs out of all sessions', () => {
    const s1 = requestAuthLogin('test@gmail.com', 'password');
    // THIS POINT, THERE ARE 2 TOKENS. CHECK
    expect(requestAuthLogout(user.token)).toStrictEqual({});
    // REMOVES THE FIRST. CHECK

    expect(s1.authUserId).toStrictEqual(user.authUserId);
    expect(s1.token).not.toStrictEqual(user.token);
    // BOTH ARE DIFFERENT. CHECK
    expect(requestUserProfile(s1.token, s1.authUserId)).toStrictEqual({
      user: {
        uId: s1.authUserId,
        email: 'test@gmail.com',
        nameFirst: 'sponge',
        nameLast: 'bob',
        handleStr: 'spongebob',
        profileImgUrl: expect.any(String)
      }
    });
    expect(requestAuthLogout(user.token)).toStrictEqual(403);
    expect(requestAuthLogout(s1.token)).toStrictEqual({});
    expect(requestUserProfile(s1.token, s1.authUserId)).toStrictEqual(403);
  });

  test('user with one session logs out', () => {
    expect(requestAuthLogout(user.token)).toStrictEqual({});
  });

  test('logging in and out multiple times', () => {
    const s1 = requestAuthLogin('test@gmail.com', 'password');
    expect(requestAuthLogout(s1.token)).toStrictEqual({});

    const s2 = requestAuthLogin('test@gmail.com', 'password');

    expect(requestAuthLogout(s2.token)).toStrictEqual({});
    const s3 = requestAuthLogin('test@gmail.com', 'password');
    expect(requestUserProfile(s3.token, s1.authUserId)).toStrictEqual({
      user: {
        uId: s3.authUserId,
        email: 'test@gmail.com',
        nameFirst: 'sponge',
        nameLast: 'bob',
        handleStr: 'spongebob',
        profileImgUrl: expect.any(String)
      }
    });
    expect(requestAuthLogout(s3.token)).toStrictEqual({});
  });
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////    Tests For auth/passwordreset/reset/v1     //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestAuthPasswordresetReset('@$(*$$(@*&#$(%#*@', 'newpass')).toStrictEqual(400);
});
describe('tests for auth/passwordreset/reset/v1', () => {
  beforeEach(() => {
    requestAuthRegister('test@gmail.com', 'password', 'first', 'last');
  });

  // 400 Error when any of:
  // 1: resetCode is not a valid reset code
  // 2: newPassword is less than 6 characters long

  // ERROR CASE: 1
  test('invalid reset code', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestAuthPasswordresetReset('@$(*$$(@*&#$(%#*@', 'newpass')).toStrictEqual(400);
  });
  /// ////////////////////////////////////////////////////////////////////////////////////////////
  // [BELOW] nearly impossible to get a correct reset code and test with it [BELOW]

  // ERROR CASE: 1.5
  // check if it invalidates the reset code after using it
  test('trying to reset password again with same reset code', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, '1234567');
    expect(requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, 'newpass2')).toStrictEqual(400);
  });

  // ERROR CASE: 2
  test('new passeord less than 6 characters long', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, '12345')).toStrictEqual(400);
  });

  // VALID CASE
  test('valid email, reset code and new password', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, '12345678')).toStrictEqual({});
  });

  //   // [ABOVE] nearly impossible to get a correct reset code and test with it [ABOVE]
  //   ///////////////////////////////////////////////////////////////////////////////////////////////
  // });

  // ERROR CASE: 1.5
  // check if it invalidates the reset code after using it
  // test('trying to reset password again with same reset code', () => {
  //   requestAuthPasswordresetReset('test@gmail.com');
  //   requestAuthPasswordresetReset('?????', 'newpass1');
  //   expect(requestAuthPasswordresetReset('', 'newpass2')).toStrictEqual(400);
  // });

  // ERROR CASE: 2
  test('invalid reset code and invalid password', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestAuthPasswordresetReset('123456', 'new1')).toStrictEqual(400);
    expect(requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, 'newpa')).toStrictEqual(400);
  });

  // // VALID CASE
  test('valid email, reset code and new password', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestAuthPasswordresetReset(requestGetResetCode('test@gmail.com').resetCode, '12345678')).toStrictEqual({});
  });

  // [ABOVE] nearly impossible to get a correct reset code and test with it [ABOVE]
  /// ////////////////////////////////////////////////////////////////////////////////////////////
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////  Tests For auth/passwordreset/request/v1  /////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestAuthPasswordresetRequest('invalidemail@')).toStrictEqual(400);
});
describe('tests for auth/passwordreset/request/v1', () => {
  // sending code will be manually tested (assumption)
  let user;
  beforeEach(() => {
    user = requestAuthRegister('test@gmail.com', 'password', 'spider', 'man');
  });

  // No error for this function
  // even in case below
  // Invalid email is given
  test('invalid email', () => {
    expect(requestAuthPasswordresetRequest('invalidemail@')).toStrictEqual({});
  });

  // VALID CASE
  test('return check with valid email', () => {
    expect(requestAuthPasswordresetRequest('test@gmail.com')).toStrictEqual({});
  });

  test('log out check with valid email', () => {
    requestAuthPasswordresetRequest('test@gmail.com');
    expect(requestUsersAll(user.token)).toStrictEqual(403);
  });
  test('admin user remove', () => {
    const user2 = requestAuthRegister('test1@gmail.com', 'password', 'spider', 'man');
    requestAdminUserRemove(user.token, user2.authUserId);
    requestAuthPasswordresetRequest('test@gmail.com');
    requestAuthPasswordresetRequest('removeduser@email.com');
    expect(requestUsersAll(user.token)).toStrictEqual(403);
  });
});
