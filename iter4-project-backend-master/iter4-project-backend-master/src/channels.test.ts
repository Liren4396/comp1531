import { requestChannelsListAll, requestChannelDetails, requestClear, requestAuthRegister, requestChannelsCreate, requestChannelsList } from './FunctionForTest';
beforeEach(() => {
  requestClear();
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelCreateV1        //////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('channelCreateV1', () => {
  let user1;
  beforeEach(() => {
    user1 = requestAuthRegister('user@email.com', 'password', 'claire', 'fan');
  });
  test('valid return - simple', () => {
    const channel = requestChannelsCreate(user1.token, 'channel1', false);
    if ('channelId' in channel) {
      expect(channel).toStrictEqual({
        channelId: expect.any(Number)
      });
    }
  });

  test('valid output - not public', () => {
    const channel = requestChannelsCreate(user1.token, 'channel1', false);
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: 'channel1',
      isPublic: false,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'user@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'user@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('valid output - public', () => {
    const channel = requestChannelsCreate(user1.token, 'channel1', true);
    expect(requestChannelDetails(user1.token, channel.channelId)).toStrictEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'user@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan',
          profileImgUrl: expect.any(String),
        }
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'user@email.com',
          nameFirst: 'claire',
          nameLast: 'fan',
          handleStr: 'clairefan',
          profileImgUrl: expect.any(String),
        }
      ]
    });
  });

  test('invalid input - name too long', () => {
    expect(requestChannelsCreate(user1.token, 'qwertyuiopasdfghjklzxcvbnm', true)).toStrictEqual(400);
  });

  test('invalid input - name too short', () => {
    expect(requestChannelsCreate(user1.token, '', true)).toStrictEqual(400);
  });

  test('invalid input - invalid token', () => {
    expect(requestChannelsCreate(user1.token + 1, 'channel', true)).toStrictEqual(403);
  });
  test('invalid input - not registered user - lots of users', () => {
    const id1 = requestAuthRegister('user1@email.com', 'password', 'claire', 'fan');
    const id2 = requestAuthRegister('user2@email.com', 'password', 'claire', 'fan');
    const id3 = requestAuthRegister('user3@email.com', 'password', 'claire', 'fan');
    const id4 = requestAuthRegister('user4@email.com', 'password', 'claire', 'fan');
    const user = id1.authUserId + id2.authUserId + id3.authUserId + id4.authUserId;
    expect(requestChannelsCreate(user, 'channel', true)).toStrictEqual(403);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelsList            ///////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('channelList empty data', () => {
  expect(requestChannelsList('123456')).toStrictEqual(400);
});
describe('Testing channelsList', () => {
  // Test case 1 - Test for a valid entry
  test('Valid input - authUserId', () => {
    const user1 = requestAuthRegister('user@example.com', 'password', 'michael', 'lorusso');
    const channel = requestChannelsCreate(user1.token, 'michael', true);
    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'michael'
      }]
    });
  });

  // Test case 2 - Test for non valid authUserId
  test('Invalid input - invalid token', () => {
    const user1 = requestAuthRegister('user@example.com', 'password', 'michael', 'lorusso');
    requestChannelsCreate(user1.token, 'michael', true);
    expect(requestChannelsList(user1.token + 1)).toStrictEqual(403);
  });

  // Test case 3 - Testing multiple channels
  test('Valid input - Testing multiple valid channels', () => {
    const user1 = requestAuthRegister('user@example.com', 'password', 'michael', 'lorusso');
    const channel1 = requestChannelsCreate(user1.token, 'Channel1', true);
    const channel2 = requestChannelsCreate(user1.token, 'Channel2', true);
    const channel3 = requestChannelsCreate(user1.token, 'Channel3', true);
    const channel4 = requestChannelsCreate(user1.token, 'Channel4', true);
    const channel5 = requestChannelsCreate(user1.token, 'Channel5', true);
    const channel6 = requestChannelsCreate(user1.token, 'Channel6', true);
    const channel7 = requestChannelsCreate(user1.token, 'Channel7', true);
    const channel8 = requestChannelsCreate(user1.token, 'Channel8', true);
    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels: [
        { channelId: channel1.channelId, name: 'Channel1' },
        { channelId: channel2.channelId, name: 'Channel2' },
        { channelId: channel3.channelId, name: 'Channel3' },
        { channelId: channel4.channelId, name: 'Channel4' },
        { channelId: channel5.channelId, name: 'Channel5' },
        { channelId: channel6.channelId, name: 'Channel6' },
        { channelId: channel7.channelId, name: 'Channel7' },
        { channelId: channel8.channelId, name: 'Channel8' }
      ]
    });
  });

  // Test case 4 - User doesn't belong to any channels
  test('Valid outpit - User doesnt belong to any channels', () => {
    const user1 = requestAuthRegister('user@example.com', 'password', 'michael', 'lorusso');
    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels: []
    });
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For channelsListAllV1         /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('Test successful -- channelsListAllV1 -- one channel', () => {
  expect(requestChannelsListAll('1234567')).toStrictEqual(400);
});
describe('Test successful -- channelsListAllV1 -- one channel', () => {
  test('Test successful -- channelsListAllV1 -- one channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const channel1 = requestChannelsCreate(person1.token, 'mychannel', true);
    expect(requestChannelsListAll(person1.token)).toStrictEqual(
      {
        channels: [{
          channelId: channel1.channelId,
          name: 'mychannel'
        }]
      });
  });
});

describe('Test successful -- channelsListAllV1 -- more channel', () => {
  test('Test successful -- channelsListAllV1 -- more channel', () => {
    const person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    const channel1 = requestChannelsCreate(person1.token, 'mychannel1', true);
    const channel2 = requestChannelsCreate(person1.token, 'mychannel2', false);
    const channel3 = requestChannelsCreate(person1.token, 'mychannel3', true);
    expect(requestChannelsListAll(person1.token)).toStrictEqual({
      channels: [
        {
          channelId: channel1.channelId,
          name: 'mychannel1'
        },
        {
          channelId: channel2.channelId,
          name: 'mychannel2'
        },
        {
          channelId: channel3.channelId,
          name: 'mychannel3'
        }
      ]
    });
  });
});

test('Test invalid -- channelsListAllV1 -- invalid token', () => {
  requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
  expect(requestChannelsListAll('token')).toStrictEqual(403);
});
