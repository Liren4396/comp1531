import {
  requestAuthRegister,
  requestClear,
  requestGetUserStat,
  requestGetUsersStat,
  requestChannelsCreate,
  requestChannelJoin,
  requestMessageSend,
  requestMessageSendDm,
  requestDmCreate,
} from './FunctionForTest';

beforeEach(() => {
  requestClear();
});

// requestChannelsCreate(token: string, name: string, isPublic: boolean)
// requestChannelJoin(token: string, channelId: number)
// requestChannelInvite(token: string, channelId: number, uId: number)
// requestChannelLeave(token: string, channelId: number)
// requestMessageSend(token: string, channelId: number, message: string)
// requestMessageRemove(token: string, messageId: number)
// requestMessageSendDm(token: string, dmId: number, message: string)
// requestMessageSendLater(token: string, channelId: number, message: string, timeSent: number)
// requestSendLaterDM(token: string, dmId: number, message: string, timeSent: number)
// requestDmCreate(token: string, uIds: number[])
// requestDmRemove(token: string, dmId: number)
// requestDmLeave(token: string, dmId: number)

test('get user stats when empty data', () => {
  expect(requestGetUserStat('123456')).toStrictEqual(400);
});

test('get all users stats when empty data', () => {
  expect(requestGetUsersStat()).toStrictEqual(400);
});

describe('test users stat', () => {
  let user;
  beforeEach(() => {
    user = requestAuthRegister('test1@gmail.com', 'password', 'jim', 'bob');
  });
  test('failed -- invalid token', () => {
    expect(requestGetUserStat('123456')).toStrictEqual(403);
  });
  test('success', () => {
    expect(requestGetUserStat(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    });
    expect(requestGetUsersStat()).toStrictEqual({
      workspaceStats: {
        channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
        dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
        messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }],
        utilizationRate: 0
      }
    });

    const channel = requestChannelsCreate(user.token, '1', true);
    requestMessageSend(user.token, channel.channelId, '1');
    expect(requestGetUserStat(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
        ],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent:
        [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
        ],
        involvementRate: 1
      }
    });

    const dm = requestDmCreate(user.token, [user.authUserId]);
    requestMessageSendDm(user.token, dm.dmId, '1');

    const user2 = requestAuthRegister('test@gmail.com', 'password', 'jim', 'bob');
    requestChannelJoin(user2.token, channel.channelId);
    requestMessageSend(user2.token, channel.channelId, '2');

    expect(requestGetUserStat(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
        ],
        messagesSent:
        [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
        ],
        involvementRate: 0.8
      }
    });
    expect(requestGetUsersStat()).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) },
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) },
          { numMessagesExist: 3, timeStamp: expect.any(Number) },
        ],
        utilizationRate: 1
      }
    });
  });
});
