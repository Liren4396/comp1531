import { requestDmDetails, requestDmCreate, requestDmRemove, requestDmMessages, requestClear, requestAuthRegister, requestMessageSendDm, requestDmList, requestDmLeave } from './FunctionForTest';

beforeEach(() => {
  requestClear();
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmRemoveV1             ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Unit tests for /dm/remove/v1 //
describe('Unit tests for /dm/remove/v1', () => {
  let dmId, token, user1, user2;
  beforeEach(() => {
    const owner = requestAuthRegister('test@gmail.com', 'password', 'jimbo', 'bob');
    user1 = requestAuthRegister('test1@gmail.com', 'password1', 'jimmothy', 'bob');
    user2 = requestAuthRegister('test2@gmail.com', 'password2', 'jim', 'bob');
    dmId = requestDmCreate(owner.token, [user1.authUserId, user2.authUserId]).dmId;
    token = owner.token;
  });

  // 400 Output
  test('non valid DM', () => {
    expect(requestDmRemove(token, dmId + 1)).toStrictEqual(400);
  });
  test('dmId valid but token is not owner', () => {
    const randomToken = requestAuthRegister('test3@gmail.com', 'password3', 'rando', 'bob').token;
    expect(requestDmRemove(randomToken, dmId)).toStrictEqual(400);
  });
  test('dmId valid but member try to remove', () => {
    expect(requestDmRemove(user2.token, dmId)).toStrictEqual(400);
  });

  test('dmID valid but token no longer in dms', () => {
    // remove everyone first so no one in the dms
    requestDmRemove(token, dmId);
    expect(requestDmRemove(token, dmId)).toStrictEqual(400);
  });

  test('token doesnt exist in dm', () => {
    const user3 = requestAuthRegister('test3@gmail.com', 'password', 'jimbo3', 'bob3');
    expect(requestDmRemove(user3.token, dmId)).toStrictEqual(400);
  });

  test('non valid token', () => {
    expect(requestDmRemove(token + 1, dmId)).toStrictEqual(403);
  });
  // Correct Output
  test('Correct Output', () => {
    expect(requestDmRemove(token, dmId)).toStrictEqual({});
  });
  test('Empty Dm case excluding the user', () => {
    requestDmLeave(user1.token, dmId);
    requestDmLeave(user1.token, dmId);
    expect(requestDmRemove(token, dmId)).toStrictEqual({});
  });
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmDetailsV1s           ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestDmDetails('invalid token', [4])).toStrictEqual(400);
});

describe('tests for /dm/details/v1', () => {
  // test('empty data', () => {
  //   expect(requestDmDetails('invalid token', [4])).toStrictEqual(400);
  // });

  let u, u1, dm;
  beforeEach(() => {
    u = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'claire', 'fan');
    u1 = requestAuthRegister('expecto@email.com', 'patronum', 'isabella', 'fan');
    dm = requestDmCreate(u.token, [u.authUserId, u1.authUserId]);
  });

  test('invalid dmId', () => {
    expect(requestDmDetails(u1.token, dm.dmId + 1)).toStrictEqual(400);
    // expect(requestDmDetails(u.token, dm.dmId + 1)).toStrictEqual(400);
  });

  test('user not apart of dm', () => {
    const u2 = requestAuthRegister('pineapple@email.com', 'spongebob', 'april', 'fan');
    expect(requestDmDetails(u2.token, dm.dmId)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestDmDetails(u1.token + '500', dm.dmId)).toStrictEqual(403);
    expect(requestDmDetails(u.token + '24', dm.dmId)).toStrictEqual(403);
  });

  test('test output - owner alphabet first', () => {
    expect(requestDmDetails(u.token, dm.dmId)).toStrictEqual(
      {
        name: 'clairefan, isabellafan',
        members: [
          {
            uId: u.authUserId,
            email: 'lumos@gmail.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u1.authUserId,
            email: 'expecto@email.com',
            nameFirst: 'isabella',
            nameLast: 'fan',
            handleStr: 'isabellafan',
            profileImgUrl: expect.any(String),
          }
        ]
      }
    );
    expect(requestDmDetails(u.token, dm.dmId)).toStrictEqual(requestDmDetails(u1.token, dm.dmId));
  });

  test('test output - owner not alphabet first', () => {
    const u2 = requestAuthRegister('pineapple@email.com', 'spongebob', 'april', 'fan');
    const dm2 = requestDmCreate(u.token, [u.authUserId, u1.authUserId, u2.authUserId]);
    expect(requestDmDetails(u.token, dm2.dmId)).toStrictEqual(
      {
        name: 'aprilfan, clairefan, isabellafan',
        members: [
          {
            uId: u.authUserId,
            email: 'lumos@gmail.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u1.authUserId,
            email: 'expecto@email.com',
            nameFirst: 'isabella',
            nameLast: 'fan',
            handleStr: 'isabellafan',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u2.authUserId,
            email: 'pineapple@email.com',
            nameFirst: 'april',
            nameLast: 'fan',
            handleStr: 'aprilfan',
            profileImgUrl: expect.any(String),
          }
        ]
      }
    );
    expect(requestDmDetails(u.token, dm2.dmId)).toStrictEqual(requestDmDetails(u1.token, dm2.dmId));
    expect(requestDmDetails(u1.token, dm2.dmId)).toStrictEqual(requestDmDetails(u2.token, dm2.dmId));
  });

  test('test output - duplicate names', () => {
    const u2 = requestAuthRegister('email1@email.com', 'spongebob', 'claire', 'fan');
    const u3 = requestAuthRegister('email2@email.com', 'spongebob', 'claire', 'fan');
    const u4 = requestAuthRegister('email3@email.com', 'spongebob', 'claire', 'fan');
    const dm2 = requestDmCreate(u.token, [u.authUserId, u1.authUserId, u2.authUserId, u3.authUserId, u4.authUserId]);
    expect(requestDmDetails(u.token, dm2.dmId)).toStrictEqual(
      {
        name: 'clairefan, clairefan0, clairefan1, clairefan2, isabellafan',
        members: [
          {
            uId: u.authUserId,
            email: 'lumos@gmail.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u1.authUserId,
            email: 'expecto@email.com',
            nameFirst: 'isabella',
            nameLast: 'fan',
            handleStr: 'isabellafan',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u2.authUserId,
            email: 'email1@email.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan0',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u3.authUserId,
            email: 'email2@email.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan1',
            profileImgUrl: expect.any(String),
          },
          {
            uId: u4.authUserId,
            email: 'email3@email.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan2',
            profileImgUrl: expect.any(String),
          }
        ]
      }
    );
    expect(requestDmDetails(u.token, dm2.dmId)).toStrictEqual(requestDmDetails(u3.token, dm2.dmId));
    expect(requestDmDetails(u3.token, dm2.dmId)).toStrictEqual(requestDmDetails(u2.token, dm2.dmId));
    expect(requestDmDetails(u3.token, dm2.dmId)).toStrictEqual(requestDmDetails(u4.token, dm2.dmId));
  });
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmMessagesV1           ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestDmMessages('', 4, 0)).toStrictEqual(400);
});

describe('tests for /dm/messages/v1', () => {
  let u, u1, dm, msg;
  beforeEach(() => {
    u = requestAuthRegister('lumos@gmail.com', 'wahsobright', 'claire', 'fan');
    u1 = requestAuthRegister('expecto@email.com', 'patronum', 'isabella', 'fan');
    dm = requestDmCreate(u.token, [u.authUserId, u1.authUserId]);
    msg = requestMessageSendDm(u.token, dm.dmId, 'i love writing tests');
  });

  test('invalid token', () => {
    expect(requestDmMessages(u.token + 2000, dm.dmId, 0)).toStrictEqual(403);
  });

  test('invalid dm', () => {
    expect(requestDmMessages(u.token, dm.dmId + 50234, 0)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestDmMessages(u.token + 'breka', dm.dmId, 0)).toStrictEqual(403);
  });

  test('valid dm but user not in dm', () => {
    const u2 = requestAuthRegister('wingardium@gmail.com', 'leviosa', 'april', 'fan');
    expect(requestDmMessages(u2.token, dm.dmId, 0)).toStrictEqual(400);
  });

  test('start greater than no. messages - 1', () => {
    expect(requestDmMessages(u.token, dm.dmId, 2)).toStrictEqual(400);
  });

  test('start greater than no. messages - 2', () => {
    requestMessageSendDm(u.token, dm.dmId, 'i love writing tests!');
    requestMessageSendDm(u.token, dm.dmId, 'i love writing tests!!');
    expect(requestDmMessages(u.token, dm.dmId, 7)).toStrictEqual(400);
  });

  test('start = no. messages', () => {
    expect(requestDmMessages(u.token, dm.dmId, 1)).toStrictEqual({
      messages: [],
      start: 1,
      end: -1,
    });
    requestMessageSendDm(u.token, dm.dmId, 'i love writing tests!');
    requestMessageSendDm(u.token, dm.dmId, 'i love writing tests!!');
    expect(requestDmMessages(u.token, dm.dmId, 3)).toStrictEqual({
      messages: [],
      start: 3,
      end: -1,
    });
  });

  test('simple output', () => {
    expect(requestDmMessages(u.token, dm.dmId, 0)).toStrictEqual({
      messages: [
        {
          messageId: msg.messageId,
          uId: u.authUserId,
          message: 'i love writing tests',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('outputting correct messages', () => {
    const msg2 = requestMessageSendDm(u1.token, dm.dmId, 'i love writing tests!');
    const msg3 = requestMessageSendDm(u.token, dm.dmId, 'i love writing tests!!');
    expect(requestDmMessages(u.token, dm.dmId, 1)).toStrictEqual({
      messages: [
        {
          messageId: msg3.messageId,
          uId: u.authUserId,
          message: 'i love writing tests!!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msg2.messageId,
          uId: u1.authUserId,
          message: 'i love writing tests!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ],
      start: 1,
      end: -1,
    });
  });
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmLeave              ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
// need requestDmLeave
test('empty data', () => {
  expect(requestDmLeave('', 4)).toStrictEqual(400);
});
describe('tests for /dm/leave/v1', () => {
  let u, u1, dm;
  beforeEach(() => {
    u = requestAuthRegister('lumos@gmail.com', 'wahsobright', 'claire', 'fan');
    u1 = requestAuthRegister('expecto@email.com', 'patronum', 'isabella', 'fan');
    dm = requestDmCreate(u.token, [u.authUserId, u1.authUserId]);
    requestMessageSendDm(u.token, dm.dmId, 'i love writing tests');
  });

  test('invalid token', () => {
    expect(requestDmLeave(u.token + 200, dm.dmId)).toStrictEqual(403);
  });

  test('failed: invalid dmId', () => {
    expect(requestDmLeave(u.token, dm.dmId + 50234)).toStrictEqual(400);
  });

  test('failed: user is not a member of the DM', () => {
    const person = requestAuthRegister('lumos1@gmail.com', 'wahsobright', 'claire', 'fan');
    expect(requestDmLeave(person.token, dm.dmId)).toStrictEqual(400);
  });
  test('failed: invalid token', () => {
    expect(requestDmLeave(u.token + 'ssfafads', dm.dmId + 50234)).toStrictEqual(400);
  });

  test('correct test', () => {
    expect(requestDmLeave(u1.token, dm.dmId)).toStrictEqual({});
    expect(requestDmDetails(u.token, dm.dmId)).toStrictEqual(
      {
        name: 'clairefan, isabellafan',
        members: [
          {
            uId: u.authUserId,
            email: 'lumos@gmail.com',
            nameFirst: 'claire',
            nameLast: 'fan',
            handleStr: 'clairefan',
            profileImgUrl: expect.any(String),
          },
        ]
      }
    );
  });
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmCreateV1             ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestDmCreate('', [])).toStrictEqual(400);
});
describe('test: /dm/create/v1', () => {
  // empty data

  let u0, u1;
  beforeEach(() => {
    u0 = requestAuthRegister('lumos@gmail.com', 'wahsobright', 'zfirst', 'last');
    u1 = requestAuthRegister('expecto@email.com', 'patronum', 'john', 'biden');
  });

  // 400 Case
  test('400 case 1: any uId does not refer to a valid user', () => {
    const invalidUId = u1.authUserId + 5000;
    const dm = requestDmCreate(u0.token, [invalidUId]);
    expect(dm).toStrictEqual(400);
  });
  test('400 case 2: duplicate uId', () => {
    const dm = requestDmCreate(u0.token, [u1.authUserId, u1.authUserId]);
    expect(dm).toStrictEqual(400);
  });
  test('403 case 3: invalid token', () => {
    const dm = requestDmCreate(u0.token + 'broken', [u1.authUserId]);
    expect(dm).toStrictEqual(403);
  });
  test('400 case 4: one valid id and one invalid id', () => {
    const invalidUId = u1.authUserId + 5000;
    const dm = requestDmCreate(u0.token, [invalidUId, u1.authUserId]);
    expect(dm).toStrictEqual(400);
    // expect(requestDmDetails(u0.token, dm.dmId).name).toStrictEqual(['johnbiden', 'zfirstlast']);
  });

  // Valid Case

  // requestDmDetails(u0.token, dm).name is undefined (400)

  test('valid case 1: one valid id', () => {
    const dm = requestDmCreate(u0.token, [u1.authUserId]);
    expect(dm).toStrictEqual({ dmId: expect.any(Number) });
    const details = requestDmDetails(u0.token, dm.dmId);
    expect(details.name).toStrictEqual('johnbiden, zfirstlast');
  });

  test('valid case 2: empty uIds', () => {
    const dm = requestDmCreate(u0.token, []);
    const details = requestDmDetails(u0.token, dm.dmId);
    expect(details.name).toStrictEqual('zfirstlast');
  });
});

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////           Tests For requestDmListV1               ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////

test('empty data', () => {
  expect(requestDmList('')).toStrictEqual(400);
});
describe('tests for /dm/list/v1', () => {
  let u, u1, dm, dm1;
  beforeEach(() => {
    u = requestAuthRegister('lumoss@gmail.com', 'password1', 'first', 'last');
    u1 = requestAuthRegister('expecto@email.com', 'password2', 'john', 'biden');
    dm = requestDmCreate(u.token, [u1.authUserId]);
    dm1 = requestDmCreate(u.token, [u.authUserId]);
  });

  // 400 Case
  test('403 case: invalid token', () => {
    expect(requestDmList(u.token + 'breka')).toStrictEqual(403);
  });

  test('valid case: user is in multiple dms', () => {
    expect(requestDmList(u.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'firstlast, johnbiden'
        },
        {
          dmId: dm1.dmId,
          name: 'firstlast'
        }
      ]
    });
  });

  test('valid case: user is in one dm', () => {
    expect(requestDmList(u1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'firstlast, johnbiden'
        },
      ]
    });
  });

  test('valid case: user not in any dms', () => {
    const u3 = requestAuthRegister('claire@gmail.com', 'needddd', 'more', 'tests');
    expect(requestDmList(u3.token)).toStrictEqual(
      {
        dms: []
      }
    );
  });

  test('valid case: lots of users in lots of dms', () => {
    const u2 = requestAuthRegister('user2@email.com', 'password', 'claire2', 'fan');
    const u3 = requestAuthRegister('user3@email.com', 'password', 'claire3', 'fan');
    const u4 = requestAuthRegister('user4@email.com', 'password', 'claire4', 'fan');
    const dm2 = requestDmCreate(u.token, [u3.authUserId, u1.authUserId, u2.authUserId]);
    const dm3 = requestDmCreate(u3.token, [u.authUserId, u1.authUserId, u2.authUserId, u4.authUserId]);
    expect(requestDmList(u2.token).name).toStrictEqual(requestDmList(u3.token).name);
    expect(requestDmList(u.token)).toStrictEqual({

      dms: [
        {
          dmId: dm.dmId,
          name: 'firstlast, johnbiden'
        },
        {
          dmId: dm1.dmId,
          name: 'firstlast'
        },
        {
          dmId: dm2.dmId,
          name: 'claire2fan, claire3fan, firstlast, johnbiden'
        },
        {
          dmId: dm3.dmId,
          name: 'claire2fan, claire3fan, claire4fan, firstlast, johnbiden'
        }

      ]
    });
  });

  test('valid case - user is only one in dm', () => {
    const u2 = requestAuthRegister('user2@email.com', 'password', 'claire2', 'fan');
    const dm2 = requestDmCreate(u2.token, []);
    expect(requestDmList(u2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm2.dmId,
          name: 'claire2fan',
        }
      ]
    });
  });
});
