import { requestClear, requestChannelMessages, requestChannelJoin, requestChannelAddowner, requestAuthRegister, requestChannelRemoveowner, requestChannelsCreate, requestChannelDetails, requestChannelInvite, requestChannelLeave } from './FunctionForTest';

beforeEach(() => {
  requestClear();
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channeladdOnwer           /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('addowner empty data', () => {
  expect(requestChannelAddowner('123456', 1, 1)).toStrictEqual(400);
});
test('addowner is not member', () => {
  const owner = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
  const user = requestAuthRegister('test@gmail.com', 'password', 'jimmothy', 'bob');
  const channelId = requestChannelsCreate(owner.token, 'test', true).channelId;
  const ownerToken = owner.token;
  const uId = user.authUserId;
  expect(requestChannelAddowner(ownerToken, channelId, uId)).toStrictEqual(400);
});
describe('Tests for channel/addowner/v1', () => {
  let owner, user, ownerToken, uId, channelId;
  beforeEach(() => {
    owner = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
    user = requestAuthRegister('test@gmail.com', 'password', 'jimmothy', 'bob');
    channelId = requestChannelsCreate(owner.token, 'test', true).channelId;
    requestChannelJoin(user.token, channelId);
    ownerToken = owner.token;
    uId = user.authUserId;
  });

  // 400 case
  test('non valid channelId', () => {
    expect(requestChannelAddowner(ownerToken, channelId + 1, uId)).toStrictEqual(400);
  });
  test('non valid uId', () => {
    expect(requestChannelAddowner(ownerToken, channelId, uId + 1)).toStrictEqual(400);
  });
  test('User not a member', () => {
    const random = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob').authUserId;
    expect(requestChannelAddowner(ownerToken, channelId, random)).toStrictEqual(400);
  });
  test('UId refers to the owner', () => {
    expect(requestChannelAddowner(ownerToken, channelId, owner.authUserId)).toStrictEqual(400);
  });

  test('Does not have owner permission', () => {
    expect(requestChannelAddowner(user.token, channelId, user.authUserId)).toStrictEqual(403);
  });

  test('non valid token', () => {
    expect(requestChannelAddowner(ownerToken + 1, channelId, uId)).toStrictEqual(403);
  });

  // Correct output
  test('Correct Output', () => {
    expect(requestChannelAddowner(ownerToken, channelId, uId)).toStrictEqual({});
  });

  test('Having an freshly made owner make another member owner', () => {
    const user1 = requestAuthRegister('test2@gmail.com', 'password1', 'tim', 'tam');
    requestChannelJoin(user1.token, channelId);
    expect(requestChannelAddowner(ownerToken, channelId, uId)).toStrictEqual({});
    expect(requestChannelAddowner(user.token, channelId, user1.authUserId)).toStrictEqual({});
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////       Tests For /channel/removeowner/v1       /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Tests for /channel/requestChannelRemoveowner/v1
describe('Tests for /channel/removeowner/v1', () => {
  let owner, user, channelId;

  beforeEach(() => {
    // Register 2 users, one will be an owner and the other will be a user
    owner = requestAuthRegister('test1@gmail.com', 'password', 'owner', 'bob');
    user = requestAuthRegister('test@gmail.com', 'password', 'user', 'bob');

    // Create a new channel with owner as the channel owner
    channelId = requestChannelsCreate(owner.token, 'test', true).channelId;

    // Now let the user join the owners channel
    requestChannelJoin(user.token, channelId);
  });

  // CHECK - channelId does not refer to a valid channel
  // CHECK - uId does not refer to a valid user
  // CHECK - uId refers to a user who is not an owner of the channel
  // CHECK - uId refers to a user who is currently the only owner of the channel
  // channelId is valid and the authorised user does not have owner permissions in the channel
  // CHECK - token is invalid
  // CHECK - Valid input

  // 400 case 1 - channelId does not refer to a valid channel
  test('non valid channelId', () => {
    expect(requestChannelRemoveowner(owner.token, channelId + 1, owner.authUserId)).toStrictEqual(400);
  });

  // 400 case 2 - uId does not refer to a valid user
  test('non valid uId', () => {
    expect(requestChannelRemoveowner(owner.token, channelId, user.authUserId + 1)).toStrictEqual(400);
  });

  // 400 case 3 - User is not a member, nor is an owner of the channel
  test('User not a member', () => {
    const random = requestAuthRegister('person3@gmail.com', 'password', 'person3', 'bob');
    expect(requestChannelRemoveowner(owner.token, channelId, random.authUserId)).toStrictEqual(400);
  });

  // 400 case 4 - uId refers to a user who is not an owner of the channel
  test('UId refers to a user who is not an owner of the channel', () => {
    expect(requestChannelRemoveowner(user.token, channelId, user.authUserId)).toStrictEqual(400);
  });

  // 400 case 5 - uId refers to a user who is currently the only owner of the channel
  test('uId refers to a user who is currently the only owner of the channel', () => {
    expect(requestChannelRemoveowner(owner.token, channelId, owner.authUserId)).toStrictEqual(400);
  });

  test('non valid token', () => {
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    requestChannelJoin(user02.token, channelId);
    requestChannelAddowner(owner.token, channelId, user02.authUserId);
    expect(requestChannelRemoveowner(owner.token + 'invalid', channelId, user02.authUserId)).toStrictEqual(403);
  });

  // Waiting for implementation
  // 400 case 6 - channelId is valid and the authorised user does not have owner permissions in the channel
  test('channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    requestChannelJoin(user02.token, channelId);

    // As user.token ISNT OWNER, he cant remove user02
    expect(requestChannelRemoveowner(user.token, channelId, user02.authUserId)).toStrictEqual(400);
  });

  test('Valid input - 2 owners', () => {
    // Make user02 an owner of the channel
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    requestChannelJoin(user02.token, channelId);
    requestChannelAddowner(owner.token, channelId, user02.authUserId);

    // Remove newOwner from the owners of the channel by the original owner
    expect(requestChannelRemoveowner(owner.token, channelId, user02.authUserId)).toStrictEqual({});
  });
  // Correct output, waiting for implementation
  test('Valid input - Owner removing self', () => {
    // Make user02 an owner of the channel
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    requestChannelJoin(user02.token, channelId);
    requestChannelAddowner(owner.token, channelId, user02.authUserId);

    // Remove original Owner from the owners of the channel by the original owner
    expect(requestChannelRemoveowner(owner.token, channelId, owner.authUserId)).toStrictEqual({});
  });

  test('Valid input - Removing a freshly added Owner', () => {
    // Make user02 an owner of the channel
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    requestChannelJoin(user02.token, channelId);
    requestChannelAddowner(owner.token, channelId, user02.authUserId);

    // Remove original Owner from the owners of the channel by the original owner
    expect(requestChannelRemoveowner(owner.token, channelId, user02.authUserId)).toStrictEqual({});
  });
  test('Valid input - many owners', () => {
    // Make user02 an owner of the channel
    const user02 = requestAuthRegister('newOwner@gmail.com', 'password', 'newUser', 'alice');
    const user03 = requestAuthRegister('newOwner1@gmail.com', 'password1', 'newUser1', 'alice1');
    const user04 = requestAuthRegister('newOwner2@gmail.com', 'password2', 'newUser2', 'alice2');
    const user05 = requestAuthRegister('newOwner3@gmail.com', 'password3', 'newUser3', 'alice3');
    const user06 = requestAuthRegister('newOwner4@gmail.com', 'password4', 'newUser4', 'alice4');
    const user07 = requestAuthRegister('newOwner5@gmail.com', 'password5', 'newUser5', 'alice5');
    requestChannelJoin(user02.token, channelId);
    requestChannelJoin(user03.token, channelId);
    requestChannelJoin(user04.token, channelId);
    requestChannelJoin(user05.token, channelId);
    requestChannelJoin(user06.token, channelId);
    requestChannelJoin(user07.token, channelId);
    requestChannelAddowner(owner.token, channelId, user02.authUserId);
    requestChannelAddowner(owner.token, channelId, user03.authUserId);
    requestChannelAddowner(owner.token, channelId, user04.authUserId);
    requestChannelAddowner(owner.token, channelId, user05.authUserId);
    requestChannelAddowner(owner.token, channelId, user06.authUserId);
    requestChannelAddowner(owner.token, channelId, user07.authUserId);

    // Remove newOwner from the owners of the channel by the original owner
    expect(requestChannelRemoveowner(owner.token, channelId, user02.authUserId)).toStrictEqual({});
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelDetails          /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('Tests for empty data for channelDetails', () => {
  expect(requestChannelDetails('1234556', 1)).toStrictEqual(400);
});

describe('Tests channelDetails', () => {
  let user;
  let channel;
  beforeEach(() => {
    user = requestAuthRegister('something@gmail.com', '123445', 'first', 'last');
    channel = requestChannelsCreate(user.token, 'test_channel', true);
  });

  test('Tests for correct data output', () => {
    expect(requestChannelDetails(user.token, channel.channelId)).toStrictEqual({
      name: 'test_channel',
      isPublic: true,
      ownerMembers: [{
        uId: user.authUserId,
        email: 'something@gmail.com',
        nameFirst: 'first',
        nameLast: 'last',
        handleStr: 'firstlast',
        profileImgUrl: expect.any(String),
      }],
      allMembers: [{
        uId: user.authUserId,
        email: 'something@gmail.com',
        nameFirst: 'first',
        nameLast: 'last',
        handleStr: 'firstlast',
        profileImgUrl: expect.any(String),
      }]
    });
  });
  test('Test for correct data output - more members', () => {
    const u1 = requestAuthRegister('user1@email.com', 'password', 'claire1', 'fan');
    const u2 = requestAuthRegister('user2@email.com', 'password', 'claire2', 'fan');
    const u3 = requestAuthRegister('user3@email.com', 'password', 'claire3', 'fan');
    const u4 = requestAuthRegister('user4@email.com', 'password', 'claire4', 'fan');
    requestChannelInvite(user.token, channel.channelId, u1.authUserId);
    requestChannelInvite(user.token, channel.channelId, u2.authUserId);
    requestChannelInvite(user.token, channel.channelId, u3.authUserId);
    requestChannelInvite(user.token, channel.channelId, u4.authUserId);
    expect(requestChannelDetails(user.token, channel.channelId)).toStrictEqual({
      name: 'test_channel',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'something@gmail.com',
          nameFirst: 'first',
          nameLast: 'last',
          handleStr: 'firstlast',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'something@gmail.com',
          nameFirst: 'first',
          nameLast: 'last',
          handleStr: 'firstlast',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u1.authUserId,
          email: 'user1@email.com',
          nameFirst: 'claire1',
          nameLast: 'fan',
          handleStr: 'claire1fan',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u2.authUserId,
          email: 'user2@email.com',
          nameFirst: 'claire2',
          nameLast: 'fan',
          handleStr: 'claire2fan',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u3.authUserId,
          email: 'user3@email.com',
          nameFirst: 'claire3',
          nameLast: 'fan',
          handleStr: 'claire3fan',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u4.authUserId,
          email: 'user4@email.com',
          nameFirst: 'claire4',
          nameLast: 'fan',
          handleStr: 'claire4fan',
          profileImgUrl: expect.any(String),
        }]
    });
  });

  test('non valid token', () => {
    expect(requestChannelDetails(user.token + 1, channel.channelId)).toStrictEqual(403);
  });

  test('non valid channelID', () => {
    expect(requestChannelDetails(user.token, channel.channelId + 1)).toStrictEqual(400);
  });

  test('token not member', () => {
    const uid = requestAuthRegister('member@email.com', 'password', 'clare', 'dan');
    expect(requestChannelDetails(uid.token, channel.channelId)).toStrictEqual(403);
  });

  test('duplicate names', () => {
    const u1 = requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    const u2 = requestAuthRegister('user2@email.com', 'password', 'claire', 'fan');
    const u3 = requestAuthRegister('user3@email.com', 'password', 'claire', 'fan');
    const u4 = requestAuthRegister('user4@email.com', 'password', 'claire', 'fan');
    requestChannelInvite(user.token, channel.channelId, u1.authUserId);
    requestChannelInvite(user.token, channel.channelId, u2.authUserId);
    requestChannelInvite(user.token, channel.channelId, u3.authUserId);
    requestChannelInvite(user.token, channel.channelId, u4.authUserId);
    expect(requestChannelDetails(user.token, channel.channelId)).toStrictEqual({
      name: 'test_channel',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'something@gmail.com',
          nameFirst: 'first',
          nameLast: 'last',
          handleStr: 'firstlast',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'something@gmail.com',
          nameFirst: 'first',
          nameLast: 'last',
          handleStr: 'firstlast',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u1.authUserId,
          email: 'user1@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u2.authUserId,
          email: 'user2@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan0',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u3.authUserId,
          email: 'user3@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan1',
          profileImgUrl: expect.any(String),
        },
        {
          uId: u4.authUserId,
          email: 'user4@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan2',
          profileImgUrl: expect.any(String),
        }]
    });
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelInvitesV1         //////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Tests channelInvitesV1', () => {
  let user1;
  let channel1;
  let uId;
  beforeEach(() => {
    user1 = requestAuthRegister('something@gmail.com', '123445', 'first', 'last');
    channel1 = requestChannelsCreate(user1.token, 'test_channel', true);
    uId = requestAuthRegister('test@gmail.com', '1232412', 'Tim', 'Jim');
  });

  test('Tests for correct data output', () => {
    expect(requestChannelInvite(user1.token, channel1.channelId, uId.authUserId)).toStrictEqual({});
  });

  test('Inviting a person twice', () => {
    expect(requestChannelInvite(user1.token, channel1.channelId, uId.authUserId)).toStrictEqual({});
    expect(requestChannelInvite(user1.token, channel1.channelId, uId.authUserId)).toStrictEqual(400);
  });
  test('Having a member inviting a user', () => {
    const user2 = requestAuthRegister('something2@gmail.com', '123445', 'first1', 'last1');
    expect(requestChannelInvite(user1.token, channel1.channelId, uId.authUserId)).toStrictEqual({});
    expect(requestChannelInvite(uId.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  });
  test('non valid channelID', () => {
    expect(requestChannelInvite(user1.token, channel1.channelId + 1, uId.authUserId)).toStrictEqual(400);
  });
  test('non valid uId ', () => {
    expect(requestChannelInvite(user1.token, channel1.channelId, uId.authUserId + 1)).toStrictEqual(400);
  });
  test('uId already a memeber', () => {
    expect(requestChannelInvite(user1.token, channel1.channelId, user1.authUserId)).toStrictEqual(400);
  });
  test('channelId valid, but token not a member', () => {
    expect(requestChannelInvite(uId.token, channel1.channelId, uId.authUserId)).toStrictEqual(403);
  });
  test('token is invalid', () => {
    expect(requestChannelInvite(user1.token + 1, channel1.channelId, uId.authUserId)).toStrictEqual(403);
  });

  // CHECK WITH TUTOR WHY THIS TEST FAILS
  test('test inviting global owner', () => {
    const u2 = requestAuthRegister('blah@email.com', 'sdfgdfgsdfs', 'claire', 'fan');
    const c2 = requestChannelsCreate(u2.token, 'hihihi', false);
    expect(requestChannelInvite(u2.token, c2.channelId, user1.authUserId)).toStrictEqual({});
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelJoin         /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Tests channelJoin', () => {
  test('Test successful -- requestChannelJoin -- one channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);
    const token = requestAuthRegister('z5369145@ad.unsw.edu.au', 'Kkkkk43967', 'Liren', 'Ding').token;
    expect(requestChannelJoin(token, channel1.channelId)).toMatchObject({});
  });

  test('Test successful -- requestChannelJoin -- more channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding').token;
    const channel1 = requestChannelsCreate(person1, 'mychannel', true);
    const person2 = requestAuthRegister('z5369145@ad.unsw.edu.au', 'Kkkkk43967', 'Liren', 'Ding').token;
    const channel2 = requestChannelsCreate(person1, 'mychannel', true);
    expect(requestChannelJoin(person2, channel1.channelId)).toStrictEqual({});
    expect(requestChannelJoin(person2, channel2.channelId)).toStrictEqual({});
  });

  test('Test fail -- requestChannelJoin -- private channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const person2 = requestAuthRegister('z5369145@ad.unsw.edu.au', 'Kjhgf4396', 'person1', 'Ding');
    const person3 = requestAuthRegister('z5369146@ad.unsw.edu.au', 'Kfghj4396', 'person2', 'Ding');
    const person4 = requestAuthRegister('z5369147@ad.unsw.edu.au', 'Kavsf4396', 'person3', 'Ding');
    const person = [];
    person.push(person1);
    person.push(person2);
    person.push(person3);
    person.push(person4);

    const channel1 = requestChannelsCreate(person[3].token, 'mychannel', false);
    expect(requestChannelJoin(person[3].token, channel1.channelId)).toStrictEqual(400);
  });
  test('Test fail -- No person and No channel', () => {
    expect(requestChannelJoin('', 1)).toStrictEqual(400);
  });

  test('Test fail -- invalid token', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding').token;
    const channel1 = requestChannelsCreate(person1, 'mychannel', true);

    expect(requestChannelJoin('123456', channel1.channelId)).toStrictEqual(403);
  });
  test('Test fail -- requestChannelJoin -- One person and No channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(requestChannelJoin(person1.token, 1)).toStrictEqual(400);
  });

  test('test join channel that user is already member of', () => {
    const u1 = requestAuthRegister('clairefan@gmail.com', 'password', 'claire', 'fan');
    const u2 = requestAuthRegister('isabellafan@gmail.com', 'passw0rd', 'isabella', 'fan');
    const c1 = requestChannelsCreate(u2.token, 'channel', false);
    expect(requestChannelJoin(u1.token, c1.channelId)).toStrictEqual({});
    expect(requestChannelJoin(u1.token, c1.channelId)).toStrictEqual(400);
  });

  test('test non global owner join private channel', () => {
    const u1 = requestAuthRegister('clairefan@gmail.com', 'password', 'claire', 'fan');
    const u2 = requestAuthRegister('isabellafan@gmail.com', 'passw0rd', 'isabella', 'fan');
    const c1 = requestChannelsCreate(u1.token, 'channel', false);
    expect(requestChannelJoin(u2.token, c1.channelId)).toStrictEqual(403);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For requestChannelMessagesV1         /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
describe('Tests requestChannelMessagesV1', () => {
  test('empty data', () => {
    const result = requestChannelMessages('123456', 1, 0);
    expect(result).toStrictEqual(400);
  });
  // VALID CASES
  test('requestChannelMessagesV1 Test1: valid IDs and 50+ messages', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);

    const result = requestChannelMessages(person1.token, channel1.channelId, 0);

    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1
    });
  });

  test('requestChannelMessagesV1 Test2: valid IDs and less than 50 messages', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(person1).toStrictEqual(
      {
        authUserId: expect.any(Number),
        token: expect.any(String)
      }
    );
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);
    const result = requestChannelMessages(person1.token, channel1.channelId, 0);
    expect(result).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: -1
    });
  });

  // ERROR CASES
  // channelId is not valid
  test('requestChannelMessagesV1 Test3: channelId refers to invalid channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(person1).toStrictEqual(
      {
        authUserId: expect.any(Number),
        token: expect.any(String)
      }
    );
    const invalidChannel = 99999999;
    const result = requestChannelMessages(person1.token, invalidChannel, 0);
    expect(result).toEqual(400);
  });

  test('requestChannelMessagesV1 Test4: start > total num of message', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(person1).toStrictEqual(
      {
        authUserId: expect.any(Number),
        token: expect.any(String)
      }
    );
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);
    expect(channel1).toStrictEqual(
      {
        channelId: expect.any(Number)
      }
    );
    const result = requestChannelMessages(person1.token, channel1.channelId, 99999999);
    expect(result).toEqual(400);
  });

  test('requestChannelMessagesV1 Test5: valid channelId but user is not member of it', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    expect(person1).toStrictEqual(
      {
        authUserId: expect.any(Number),
        token: expect.any(String)
      }
    );
    const user1 = requestAuthRegister('something@gmail.com', '123445', 'first', 'last');
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);
    const result = requestChannelMessages(user1.token, channel1.channelId, 0);
    expect(result).toEqual(400);
  });

  test('requestChannelMessagesV1 Test6: token is invalid', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const channel1 = requestChannelsCreate(person1, 'mychannel', true);
    expect(channel1).toStrictEqual(403);
    const invalidauthUderId = 99999999;
    const result = requestChannelMessages(person1 + invalidauthUderId, channel1.channelId, 0);
    expect(result).toEqual(403);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For requestChannelLeaveV1          ///////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('ChannelInvite empty data', () => {
  expect(requestChannelInvite('123456', 1, 1)).toStrictEqual(400);
});
test('ChannelLeaveV1 empty data', () => {
  expect(requestChannelLeave('123456', 1)).toStrictEqual(400);
});
describe('Tests requestChannelLeaveV1', () => {
  let user1;
  let channel1, user2;
  // let uId;
  beforeEach(() => {
    user1 = requestAuthRegister('something@gmail.com', '123445', 'first', 'last');
    user2 = requestAuthRegister('something1@gmail.com', '123445', 'first1', 'last');
    channel1 = requestChannelsCreate(user1.token, 'test_channel', true);
    requestChannelInvite(user1.token, channel1.channelId, user2.authUserId);
    // uId = requestAuthRegister('test@gmail.com', '1232412', 'Tim', 'Jim');
  });

  test('failed: channelId does not refer to a valid channel', () => {
    expect(requestChannelLeave(user1.token, channel1.channelId + 1)).toStrictEqual(400);
  });

  test('failed: channelId is valid and the authorised user is not a member of the channel', () => {
    const u2 = requestAuthRegister('blah@email.com', 'sdfgdfgsdfs', 'claire', 'fan');
    expect(requestChannelLeave(u2.token, channel1.channelId)).toStrictEqual(400);
  });
  test('failed: token is invalid', () => {
    expect(requestChannelLeave(user1.token + 1, channel1.channelId)).toStrictEqual(403);
  });
  test('correct test', () => {
    expect(requestChannelLeave(user2.token, channel1.channelId)).toStrictEqual({});
  });
  test('correct test - removing Owner', () => {
    expect(requestChannelLeave(user1.token, channel1.channelId)).toStrictEqual({});
  });
});
