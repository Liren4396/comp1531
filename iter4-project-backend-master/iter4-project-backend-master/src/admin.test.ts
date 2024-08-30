import {
  requestClear,
  requestAuthRegister,
  requestChannelJoin,
  requestChannelsCreate,
  requestChannelDetails,
  requestAdminUserRemove,
  requestDmCreate,
  requestUsersAll,
  requestMessageSend,
  requestChannelMessages,
  requestMessageSendDm,
  requestDmMessages,
  requestUserProfile,
  requestDmDetails,
  requestAdminUserpermissionChange,
  requestChannelAddowner
} from './FunctionForTest';

beforeEach(() => {
  requestClear();
});

requestClear();
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////  Tests For admin/userpermission/change/v1 /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data', () => {
  expect(requestAdminUserpermissionChange('', 0, 0)).toStrictEqual(400);
});
describe('admin/userpermission/change/v1', () => {
  let owner, user;
  beforeEach(() => {
    owner = requestAuthRegister('winniepooh@gmail.com', 'poohbear', 'winnie', 'thepooh');
    user = requestAuthRegister('harrypotter@gmail.com', 'thechosenone', 'harry', 'potter');
  });

  // owner permissionId = 1, member permissionId = 2
  test('invalid uId', () => {
    // not a global onwner
    expect(requestAdminUserpermissionChange(user.token, 1231123, 1)).toStrictEqual(403);
    expect(requestAdminUserpermissionChange(owner.token, 1231123, 1)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestAdminUserpermissionChange('invalid token', user.authUserId, 1)).toStrictEqual(403);
  });

  test('invalid permissionId', () => {
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 1000)).toStrictEqual(400);
  });

  test('user already has permissions of permissionId', () => {
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 2)).toStrictEqual(400);
    expect(requestAdminUserpermissionChange(owner.token, owner.authUserId, 1)).toStrictEqual(400);
  });

  test('the only global owner gets denoted', () => {
    expect(requestAdminUserpermissionChange(owner.token, owner.authUserId, 2)).toStrictEqual(400);
  });

  test('authUser isnt global owner', () => {
    expect(requestAdminUserpermissionChange(user.token, owner.authUserId, 2)).toStrictEqual(403);
  });

  test('valid input #1 can join private channel', () => {
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 1)).toStrictEqual({});
    // MAKING 2 OWNERS
    const name = 'channel1';
    const channel = requestChannelsCreate(owner.token, name, false);

    expect(requestChannelJoin(user.token, channel.channelId)).toStrictEqual({});
    expect(requestChannelDetails(user.token, channel.channelId).allMembers).toStrictEqual([
      {
        uId: owner.authUserId,
        email: 'winniepooh@gmail.com',
        nameFirst: 'winnie',
        nameLast: 'thepooh',
        handleStr: 'winniethepooh',
        profileImgUrl: expect.any(String),
      },
      {
        uId: user.authUserId,
        email: 'harrypotter@gmail.com',
        nameFirst: 'harry',
        nameLast: 'potter',
        handleStr: 'harrypotter',
        profileImgUrl: expect.any(String),
      }
    ]);
  });

  test('valid input #2 can change other users permission', () => {
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 1)).toStrictEqual({});
    const user1 = requestAuthRegister('princesspolly@gmail.com', 'littlekingdom', 'princess', 'polly');
    expect(requestAdminUserpermissionChange(user.token, user1.authUserId, 1)).toStrictEqual({});
  });

  test('valid input #3 can denote og owner to normal member', () => {
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 1)).toStrictEqual({});
    expect(requestAdminUserpermissionChange(user.token, owner.authUserId, 2)).toStrictEqual({});
    expect(requestAdminUserpermissionChange(owner.token, user.authUserId, 1)).toStrictEqual(403);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////       Tests For admin/user/remove/v1      /////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('admin/user/remove/v1', () => {
  expect(requestAdminUserRemove('123', 1231123)).toStrictEqual(400);
  let owner, user;
  beforeEach(() => {
    owner = requestAuthRegister('winniepooh@gmail.com', 'poohbear', 'winnie', 'thepooh');
    user = requestAuthRegister('harrypotter@gmail.com', 'thechosenone', 'harry', 'potter');
  });

  // 400 ERROR: invalid uId
  test('invalid uId', () => {
    expect(requestAdminUserRemove(owner.token, 1231123)).toStrictEqual(400);
  });

  // 403 ERROR: invalid token
  test('invalid token', () => {
    expect(requestAdminUserRemove('invalid token', user.authUserId)).toStrictEqual(403);
  });

  // 400 ERROR: uId refers to a user who is the only global owner
  test('user is the only global owner', () => {
    expect(requestAdminUserRemove(owner.token, owner.authUserId)).toStrictEqual(400);
  });

  // 403: the authorised user is not a global owner
  test('authUser isnt global owner', () => {
    expect(requestAdminUserRemove(user.token, owner.authUserId)).toStrictEqual(403);
  });

  // VALID CASE
  // user should be removed from all channels
  test('user removed from all channels', () => {
    const channel1 = requestChannelsCreate(owner.token, 'firstch', true);
    const channel2 = requestChannelsCreate(owner.token, 'secondch', true);
    expect(requestChannelJoin(user.token, channel1.channelId)).toStrictEqual({});
    expect(requestChannelJoin(user.token, channel2.channelId)).toStrictEqual({});
    requestChannelAddowner(owner.token, channel1.channelId, user.authUserId);
    requestChannelAddowner(owner.token, channel2.channelId, user.authUserId);
    expect(requestAdminUserRemove(owner.token, user.authUserId)).toStrictEqual({});
    expect(requestChannelDetails(owner.token, channel1.channelId).allMembers).toStrictEqual([
      {
        uId: owner.authUserId,
        email: 'winniepooh@gmail.com',
        nameFirst: 'winnie',
        nameLast: 'thepooh',
        handleStr: 'winniethepooh',
        profileImgUrl: expect.any(String),
      }
    ]);
    expect(requestChannelDetails(owner.token, channel2.channelId).allMembers).toStrictEqual([
      {
        uId: owner.authUserId,
        email: 'winniepooh@gmail.com',
        nameFirst: 'winnie',
        nameLast: 'thepooh',
        handleStr: 'winniethepooh',
        profileImgUrl: expect.any(String),
      }
    ]);
  });

  // user should be removed from all DMs
  test('user removed from all DMs', () => {
    const owner2 = requestAuthRegister('yourbosisme@gmail.com', 'bosisme12345', 'naturalborn', 'boss');
    const dmMember1 = [owner.authUserId, user.authUserId];
    const dmMember2 = [owner2.authUserId, user.authUserId];
    const dm1 = requestDmCreate(owner.token, dmMember1);
    const dm2 = requestDmCreate(owner2.token, dmMember2);
    expect(requestAdminUserRemove(owner.token, user.authUserId)).toStrictEqual({});
    expect(requestDmDetails(owner.token, dm1.dmId).members).toStrictEqual([
      {
        uId: owner.authUserId,
        email: 'winniepooh@gmail.com',
        nameFirst: 'winnie',
        nameLast: 'thepooh',
        handleStr: 'winniethepooh',
        profileImgUrl: expect.any(String),
      }
    ]);
    expect(requestDmDetails(owner2.token, dm2.dmId).members).toStrictEqual([
      {
        uId: owner2.authUserId,
        email: 'yourbosisme@gmail.com',
        nameFirst: 'naturalborn',
        nameLast: 'boss',
        handleStr: 'naturalbornboss',
        profileImgUrl: expect.any(String),
      }
    ]);
  });

  // user should be removed from array of users returned by users/all
  test('user removed from users/all array', () => {
    expect(requestAdminUserRemove(owner.token, user.authUserId)).toStrictEqual({});
    expect(requestUsersAll(owner.token).users).toStrictEqual([
      {
        uId: owner.authUserId,
        email: 'winniepooh@gmail.com',
        nameFirst: 'winnie',
        nameLast: 'thepooh',
        handleStr: 'winniethepooh',
        profileImgUrl: expect.any(String),
      }
    ]);
  });

  // add test using userpermissionchange
  test('updated owner permission can remove original owner', () => {
    requestAdminUserpermissionChange(owner.token, user.authUserId, 1);
    expect(requestAdminUserRemove(user.token, owner.authUserId)).toStrictEqual({});
    expect(requestUsersAll(user.token).users).toStrictEqual([
      {
        uId: user.authUserId,
        email: 'harrypotter@gmail.com',
        nameFirst: 'harry',
        nameLast: 'potter',
        handleStr: 'harrypotter',
        profileImgUrl: expect.any(String),
      }
    ]);
  });

  // once a user is removed, the contents of the messages they sent will be replaced by 'Removed user'
  test('channel message sent by removed user', () => {
    const channel1 = requestChannelsCreate(owner.token, 'firstch', true);
    expect(requestChannelJoin(user.token, channel1.channelId)).toStrictEqual({});
    const msg = requestMessageSend(user.token, channel1.channelId, 'nobody knows i will be removed lol');
    expect(requestAdminUserRemove(owner.token, user.authUserId)).toStrictEqual({});
    const msgDetail = requestChannelMessages(owner.token, channel1.channelId, 0);
    expect(msgDetail).toStrictEqual({
      messages: [
        {
          messageId: msg.messageId,
          uId: user.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  // once a user is removed, the contents of the messages they sent will be replaced by 'Removed user'
  test('DM message sent by removed user', () => {
    const dmMember1 = [owner.authUserId, user.authUserId];
    const dm1 = requestDmCreate(owner.token, dmMember1);
    const msg = requestMessageSendDm(user.token, dm1.dmId, 'nobody knows i will be removed lol');
    expect(requestAdminUserRemove(owner.token, user.authUserId)).toStrictEqual({});
    const msgDetail = requestDmMessages(owner.token, dm1.dmId, 0);
    expect(msgDetail).toStrictEqual({
      messages: [
        {
          messageId: msg.messageId,
          uId: user.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: [],
        },
      ],
      start: 0,
      end: -1,
    });
  });

  // Their profile must still be retrievable with user/profile, however nameFirst should be 'Removed' and nameLast should be 'user'.
  // The user's email and handle should be reusable.
  test('user profile still reusable', () => {
    const uId = user.authUserId;
    expect(requestAdminUserRemove(owner.token, uId)).toStrictEqual({});
    expect(requestUserProfile(owner.token, uId)).toStrictEqual({
      user: {
        uId: uId,
        email: 'removeduser@email.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: 'removeduser',
        profileImgUrl: ''
      }
    });
  });
});
