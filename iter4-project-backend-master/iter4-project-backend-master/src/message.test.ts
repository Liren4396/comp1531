import {
  requestClear,
  requestChannelJoin,
  requestAuthRegister,
  requestChannelMessages,
  requestChannelsCreate,
  requestDmCreate,
  requestMessageSend,
  requestMessageSendDm,
  requestMessageEdit,
  requestDmMessages,
  requestMessageReact,
  requestMessagePin,
  requestMessageUnpin,
  requestGetNotification,
  requestChannelLeave,
  requestDmLeave,
  requestMessageSendLater,
  requestSendLaterDM,
  requestChannelInvite,
  requestMessageShare
} from './FunctionForTest';

beforeEach(() => {
  requestClear();
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For getNotification        ////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('/notifications/get/v1', () => {
  let user, channel, dm, u1, u2;
  beforeEach(() => {
    user = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'harry', 'potter');
    u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    u2 = requestAuthRegister('123456@gmail.com', 'abcdefg', 'hello', 'world');
    channel = requestChannelsCreate(user.token, 'hogwarts', true);
    dm = requestDmCreate(user.token, [u1.authUserId, u2.authUserId]);
  });
  test('valid tes - get notification in channel and dm', () => {
    requestChannelInvite(user.token, channel.channelId, u1.authUserId);
    requestChannelInvite(user.token, channel.channelId, u2.authUserId);
    const m1 = requestMessageSend(user.token, channel.channelId, '@ronweasley ');
    requestMessageSend(user.token, channel.channelId, '@ronweasley');

    const m2 = requestMessageSendDm(user.token, dm.dmId, '@ronweasley ');
    requestMessageSend(user.token, channel.channelId, '@helloworld');
    requestMessageSend(user.token, channel.channelId, '@helloworld');
    requestMessageSendDm(user.token, dm.dmId, '@helloworld');
    // normal test

    expect(requestGetNotification(u2.token)).toStrictEqual({
      notifications: [{ channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter tagged you in harrypotter, helloworld, ronweasley: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter added you to hogwarts' },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter added you to harrypotter, helloworld, ronweasley' }]
    });
    // If an action triggering a notification has been 'undone' ,
    // the original notification should not be affected and will remain.
    requestMessageEdit(user.token, m1.messageId, 'welcome!');
    requestMessageEdit(user.token, m2.messageId, 'welcome!');
    expect(requestGetNotification(u1.token)).toStrictEqual({
      notifications: [
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter tagged you in harrypotter, helloworld, ronweasley: @ronweasley ' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @ronweasley' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @ronweasley ' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter added you to hogwarts' },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter added you to harrypotter, helloworld, ronweasley' },
      ]
    });
    const m3 = requestMessageSend(u2.token, channel.channelId, 'hi');
    requestMessageReact(user.token, m3.messageId, 1);
    expect(requestGetNotification(u2.token)).toStrictEqual({
      notifications: [
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter reacted to your message in hogwarts' },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter tagged you in harrypotter, helloworld, ronweasley: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @helloworld' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter added you to hogwarts' },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'harrypotter added you to harrypotter, helloworld, ronweasley' },
      ]
    });

    // Notifying yourself
    requestMessageReact(user.token, m1.messageId, 1);
    requestMessageReact(user.token, m1.messageId, 1);
    expect(requestGetNotification(user.token)).toStrictEqual({
      notifications: []
    });

    // A user should not be notified of any reactions to their messages
    // if they are no longer in the channel/DM that the message was sent in.
    requestChannelLeave(user.token, channel.channelId);
    requestMessageReact(u1.token, m1.messageId, 1);
    expect(requestGetNotification(user.token)).toStrictEqual({
      notifications: []
    });

    requestDmLeave(user.token, dm.dmId);
    requestMessageReact(u1.token, m2.messageId, 1);
    expect(requestGetNotification(user.token)).toStrictEqual({
      notifications: []
    });

    // A user should be notified if they tag themselves in a message.
    requestChannelJoin(user.token, channel.channelId);
    requestMessageSend(user.token, channel.channelId, '@harrypotter defghijklmnopqrstuvwxyz');
    expect(requestGetNotification(user.token)).toStrictEqual({
      notifications: [
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'harrypotter tagged you in hogwarts: @harrypotter defghij' },
      ]
    });
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For message/sendlater/v1          /////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms * 1000));
}

describe('test for /message/sendlater/v1', () => {
  let owner, user, channelId1, channelId2, channelId3;
  beforeEach(() => {
    // Create an owner DM and a reciever DM
    owner = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    user = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    // Channel
    channelId1 = requestChannelsCreate(owner.token, 'channel1', true).channelId;
    channelId2 = requestChannelsCreate(owner.token, 'channel2', true).channelId;
    channelId3 = requestChannelsCreate(owner.token, 'channel3', true).channelId;
  });
  // Error case
  // 400
  test('channelId does not refer to a valid channel', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(owner.token, channelId1 + 1000, 'hi', currentTime + 1)).toStrictEqual(400);
  });
  test('length of message is less than 1 characters', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(owner.token, channelId1, '', currentTime + 1)).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const longString = 'iIagf0VASUQE5aor2aiMLRtp17H9WXGzuSv2za0w68At2KBpGW4ZxZjJaNQgOIlFH3jWG5hJYhkZ7kTja40lylS5v1lqLyqF63zUIp1aKiXO0NtRPbZtUmb9EpjLMyhXXkQRfSgKUyeixjdqnCGAuL4EKP9kMxio9mKXDcSEvx6AXtrtGQeTd3bh1MOLjE03BVNA9sj1gnwxtwLPiUXmfchRXaf6iPxPirinJq3Jy85VMXIhlYWyQmbgkEMKGV9MqJqFi0wZxHpcyqtpG9qsm5khJmYJraAX1FIUOEd721SScDmTH3IxyC3lEujoPhWuhwE76KLm0YFAGgWnN6xG7GUr1JAcHxO1KxwvhGOumCw44AyS3w0THDwarTv2PlK6Hj43YV9VSwiTheAUd7DGrK5TSlxZFN4BCjOCMOHIAmGoZulsLNkQQce6it32BjoQwEqd3EG6oSO0ZFeXp4NKtJtO1jtCcgjwDnmudcZ9kLiOJvBcLicHeBQ5vPThyqnPYFT1xfjeteMxeaw87dIdAikeKd9P5gHlwZyKQIRPgKM0gQ6OJaB7631JiozhYdIOnno0YP52zg1gJLQqE3TryDF5tUlbLc5SuCBSPVTUCHzs6kENRIqFtoQTl9apM8JPcumh3TpBPIBjKUJOgCEowUJO9ZuMNjXLdQCnn5Yi5pOT2Po9aMRLoB5dz1KhZEPtGVLj0I8sHcYb7lLlR2jvuXZkrOLQ6kFuiKSMSmVbHmRZHqRWnGq5TXBjaHQBAT3JYg3mR5D3mK10EWuveJDlCC4AJGF6NnMstc0ZV4KkIQkP0dyvSIyF3NH6w1mIkQ7rBwVTYu7wfCRqh5Z6PSaAqlFo9BpfBUZ0kGLb4weBivxHQlXdgJlLJKrT41XaJmeNBRRMLP7I3LM9TtGfRYuLd2dtAWW2WpgkByJD0FOdP1AeJ87K4wNYWPirnaO1EiCYc87UIRpIINgBW1lWCItT7GUdnXZgYMirVh19Xsb0dssssssssssss';
    expect(requestMessageSendLater(owner.token, channelId1, longString, currentTime + 1)).toStrictEqual(400);
  });
  test('timeSent is a time in the past', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(owner.token, channelId1, 'hi', currentTime - 1)).toStrictEqual(400);
  });

  // 403 Error
  test('channelId is valid and the authorised user is not a member of the channel they are trying to post to', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(user.token, channelId1, 'hi', currentTime + 1)).toStrictEqual(403);
  });

  // Correct output
  test('Correct output - owner sending message across 3 channel ', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(owner.token, channelId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(requestMessageSendLater(owner.token, channelId2, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(requestMessageSendLater(owner.token, channelId3, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    await sleep(1);
  });
  test('Correct output - channel member sending message across 3 channel', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    requestChannelJoin(user.token, channelId1);
    requestChannelJoin(user.token, channelId2);
    requestChannelJoin(user.token, channelId3);
    expect(requestMessageSendLater(user.token, channelId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(requestMessageSendLater(user.token, channelId2, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    expect(requestMessageSendLater(user.token, channelId3, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    await sleep(1);
  });

  test('Correct output - sending the message directly afterwards', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestMessageSendLater(owner.token, channelId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    await sleep(1);
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/pin/v1          //////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('/message/pin/v1', () => {
  let user1, user2, user3, channel, m1, m2, dm;
  beforeEach(() => {
    user1 = requestAuthRegister('test1@gmail.com', 'password1', 'person1', 'lastname1');
    user2 = requestAuthRegister('test2@gmail.com', 'password2', 'person2', 'lastname2');
    user3 = requestAuthRegister('test3@gmail.com', 'password3', 'person3', 'lastname3');

    channel = requestChannelsCreate(user1.token, 'hogwarts', true);
    m1 = requestMessageSend(user1.token, channel.channelId, 'hi');

    dm = requestDmCreate(user1.token, [user2.authUserId]);
    m2 = requestMessageSendDm(user2.token, dm.dmId, 'hello there');
  });

  test('invalid messageId - not in channel', () => {
    expect(requestMessagePin(user1.token, m1.messageId + 1000)).toStrictEqual(400);
  });

  test('invalid messageId - not in dm', () => {
    expect(requestMessagePin(user3.token, m1.messageId)).toStrictEqual(400);
  });

  test('message is already pinned', () => {
    // Pin in Channel
    expect(requestMessagePin(user1.token, m1.messageId)).toStrictEqual({});
    expect(requestMessagePin(user1.token, m1.messageId)).toStrictEqual(400);

    // Pin in DM
    expect(requestMessagePin(user1.token, m2.messageId)).toStrictEqual({});
    expect(requestMessagePin(user1.token, m2.messageId)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestMessagePin(user1.token + 4, m2.messageId)).toStrictEqual(403);
    expect(requestMessagePin(user2.token + 4, m1.messageId)).toStrictEqual(403);
  });

  // test that
  // create new channel without owner
  test('person trying to pin without global owner or channel/dm owner', () => {
    const user4 = requestAuthRegister('test4@gmail.com', 'password4', 'person4', 'lastname4');
    const user5 = requestAuthRegister('test5@gmail.com', 'password5', 'person5', 'lastname5');

    const newChannel = requestChannelsCreate(user4.token, 'new', true);
    requestChannelJoin(user5.token, newChannel.channelId);
    const newMessage1 = requestMessageSend(user4.token, newChannel.channelId, 'howdy');
    expect(requestMessagePin(user4.token, newMessage1.messageId)).toStrictEqual({});
    expect(requestMessagePin(user5.token, newMessage1.messageId)).toStrictEqual(403);
    const channelMsg = requestChannelMessages(user4.token, newChannel.channelId, 0);
    expect(channelMsg).toStrictEqual({
      messages: [{
        messageId: newMessage1.messageId,
        uId: user4.authUserId,
        message: 'howdy',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true
      }],
      start: 0,
      end: -1,
    });
    // // unpin and let the global owner pin
    // requestMessageUnpin(user1.token, newMessage1.messageId)
    // expect(requestMessagePin(user1.token, newMessage1.messageId)).toStrictEqual({});

    const dmNew = requestDmCreate(user4.token, [user5.authUserId]);
    const newMessage2 = requestMessageSendDm(user4.token, dmNew.dmId, 'testing this');
    expect(requestMessagePin(user4.token, newMessage2.messageId)).toStrictEqual({});
    expect(requestMessagePin(user5.token, newMessage2.messageId)).toStrictEqual(403);
    const dmMsg = requestDmMessages(user4.token, dmNew.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: newMessage2.messageId,
        uId: user4.authUserId,
        message: 'testing this',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true
      }],
      start: 0,
      end: -1,
    });

    // // unpin and let the global owner pin
    // requestMessageUnpin(user1.token, newMessage2.messageId)
    // expect(requestMessagePin(user1.token, newMessage2.messageId)).toStrictEqual({});
  });

  test('correct input and result test 1', () => {
    // Pin in Channel
    expect(requestMessagePin(user1.token, m1.messageId)).toStrictEqual({});
    const channelMsg = requestChannelMessages(user1.token, channel.channelId, 0);
    expect(channelMsg).toStrictEqual({
      messages: [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true
      }],
      start: 0,
      end: -1,
    });

    // Pin in DM
    expect(requestMessagePin(user1.token, m2.messageId)).toStrictEqual({});
    const dmMsg = requestDmMessages(user1.token, dm.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'hello there',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true
      }],
      start: 0,
      end: -1,
    });
  });
  test('valid pin - multiple members of channel', () => {
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    // CHANNEL HAS ALL MEMBERS NOW
    expect(requestMessagePin(user1.token, m1.messageId)).toStrictEqual({});
    expect(requestMessagePin(user2.token, m1.messageId)).toStrictEqual(403);
    expect(requestMessagePin(user3.token, m1.messageId)).toStrictEqual(403);
    expect(requestChannelMessages(user1.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: true
      }]
    );
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/unpin/v1          //////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('/message/unpin/v1', () => {
  let user1, user2, user3, channel, m1, m2, dm;
  beforeEach(() => {
    user1 = requestAuthRegister('test1@gmail.com', 'password1', 'person1', 'lastname1');
    user2 = requestAuthRegister('test2@gmail.com', 'password2', 'person2', 'lastname2');
    user3 = requestAuthRegister('test3@gmail.com', 'password3', 'person3', 'lastname3');

    channel = requestChannelsCreate(user1.token, 'hogwarts', true);
    m1 = requestMessageSend(user1.token, channel.channelId, 'hi');

    dm = requestDmCreate(user2.token, [user3.authUserId]);
    m2 = requestMessageSendDm(user2.token, dm.dmId, 'hello there');

    requestMessagePin(user1.token, m1.messageId);
    requestMessagePin(user2.token, m2.messageId);
  });

  // CHANNEL: 'hogwarts' (user1)
  //          - user1: 'hi' (pinned)

  // DM: (user2 and user3)
  //          - user2: 'hello there' (pinned)

  test('invalid messageId - not in channel', () => {
    expect(requestMessagePin(user1.token, m1.messageId + 1000)).toStrictEqual(400);
  });

  test('invalid messageId - not in dm', () => {
    expect(requestMessagePin(user3.token, m1.messageId)).toStrictEqual(400);
  });

  test('message is not already pinned', () => {
    expect(requestMessageUnpin(user1.token, m1.messageId)).toStrictEqual({});
    expect(requestMessageUnpin(user1.token, m1.messageId)).toStrictEqual(400);
    expect(requestMessageUnpin(user2.token, m2.messageId)).toStrictEqual({});
    expect(requestMessageUnpin(user2.token, m2.messageId)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestMessageUnpin(user1.token + 400, m2.messageId)).toStrictEqual(403);
  });

  // test that
  // create new channel without owner
  test('person trying to pin without global owner or channel/dm owner', () => {
    const user4 = requestAuthRegister('test4@gmail.com', 'password4', 'person4', 'lastname4');
    const user5 = requestAuthRegister('test5@gmail.com', 'password5', 'person5', 'lastname5');

    const newChannel = requestChannelsCreate(user4.token, 'new', true);
    requestChannelJoin(user5.token, newChannel.channelId);
    const newMessage1 = requestMessageSend(user4.token, newChannel.channelId, 'howdy');
    requestMessagePin(user4.token, newMessage1.messageId);

    expect(requestMessageUnpin(user5.token, newMessage1.messageId)).toStrictEqual(403);
    expect(requestMessageUnpin(user4.token, newMessage1.messageId)).toStrictEqual({});
    const channelMsg = requestChannelMessages(user4.token, newChannel.channelId, 0);
    expect(channelMsg).toStrictEqual({
      messages: [{
        messageId: newMessage1.messageId,
        uId: user4.authUserId,
        message: 'howdy',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
    // // unpin and let the global owner pin
    // requestMessageUnpin(user1.token, newMessage1.messageId)
    // expect(requestMessagePin(user1.token, newMessage1.messageId)).toStrictEqual({});

    const dmNew = requestDmCreate(user4.token, [user5.authUserId]);
    const newMessage2 = requestMessageSendDm(user4.token, dmNew.dmId, 'testing this');
    requestMessagePin(user4.token, newMessage2.messageId);

    expect(requestMessageUnpin(user5.token, newMessage2.messageId)).toStrictEqual(403);
    expect(requestMessageUnpin(user4.token, newMessage2.messageId)).toStrictEqual({});

    const dmMsg = requestDmMessages(user4.token, dmNew.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: newMessage2.messageId,
        uId: user4.authUserId,
        message: 'testing this',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });

    // // unpin and let the global owner pin
    // requestMessageUnpin(user1.token, newMessage2.messageId)
    // expect(requestMessagePin(user1.token, newMessage2.messageId)).toStrictEqual({});
  });

  test('valid unpin - owner in channel', () => {
    expect(requestMessageUnpin(user1.token, m1.messageId)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }]
    );
  });

  test('valid unpin - owner in DM', () => {
    expect(requestMessageUnpin(user2.token, m2.messageId)).toStrictEqual({});
    expect(requestDmMessages(user2.token, dm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'hello there',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }]
    );
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/share/v1          ////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Tests for /message/share/v1', () => {
  // ogMessageId:   is the ID of the original message.
  // channelId:     is the channel that the message is being shared to
  //                    - and is -1 if it is being sent to a DM.
  // dmId:          is the DM that the message is being shared to
  //                    - and is -1 if it is being sent to a channel.
  // OPTIONAL
  // message:       is the optional message in addition to the shared message
  //                    - will be an empty string '' if no message is given.

  // 400 Error when any of:
  //    - both channelId and dmId are invalid
  //    - neither channelId nor dmId are -1
  //    - ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined
  //    - length of optional message is more than 1000 characters

  // 403 Error when:
  //    - the pair of channelId and dmId are valid (i.e. one is -1, the other is valid)
  //      and the authorised user has not joined the channel or DM they are trying to share the message to

  let user1, user2, channelId, dmId, ogMessageIdChannel, ogMessageIdDm, message;

  beforeEach(() => {
  // Register and create DMs and Channels
    user1 = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    user2 = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    channelId = requestChannelsCreate(user1.token, 'channel1', true).channelId;
    dmId = requestDmCreate(user1.token, [user2.authUserId]).dmId;

    // Send an original message
    ogMessageIdChannel = requestMessageSend(user1.token, channelId, 'test message').messageId;
    ogMessageIdDm = requestMessageSendDm(user1.token, channelId, 'test message').messageId;

    message = 'Optional message';
  });

  // 403 ERRORS
  test('invalid token', () => {
    // sent to channel
    expect(requestMessageShare(user1.token + 1000, ogMessageIdChannel, message, -1, dmId)).toStrictEqual(403);

    // sent to dm
    expect(requestMessageShare(user1.token + 1000, ogMessageIdDm, message, channelId, -1)).toStrictEqual(403);
  });

  test('valid token, user has not joined the channel they are trying to share the message to', () => {
    // sent to channel that they are not part of
    const user3 = requestAuthRegister('test3@gmail.com', 'password', 'person3', 'bob');
    requestChannelInvite(user1.token, channelId, user2.authUserId);
    const channelId2 = requestChannelsCreate(user3.token, 'channel2', true).channelId;
    expect(requestMessageShare(user2.token, ogMessageIdChannel, message, channelId2, -1)).toStrictEqual(403);
  });

  test('valid token, user has not joined the DM they are trying to share the message to', () => {
    // sent to dm that they are not part of
    const user3 = requestAuthRegister('test3@gmail.com', 'password', 'person3', 'bob');
    const dmId2 = requestDmCreate(user1.token, [user3.authUserId]).dmId;
    expect(requestMessageShare(user2.token, ogMessageIdDm, message, -1, dmId2)).toStrictEqual(403);
  });

  // 400 ERRORS
  test('both channelId and dmId are invalid', () => {
    const invalidChannelId = -2;
    const invalidDmId = -2;
    expect(requestMessageShare(user1.token, ogMessageIdChannel, message, invalidChannelId, invalidDmId)).toStrictEqual(400);
  });

  test('neither channelId nor dmId are -1', () => {
    expect(requestMessageShare(user1.token, ogMessageIdChannel, message, channelId, dmId)).toStrictEqual(400);
  });

  test('ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const invalidOgMessageId = -111111111111;

    // sent to channel
    expect(requestMessageShare(user1.token, invalidOgMessageId, message, channelId, -1)).toStrictEqual(400);

    // sent to dm
    expect(requestMessageShare(user1.token, invalidOgMessageId, message, -1, dmId)).toStrictEqual(400);
  });

  test('length of optional message is more than 1000 characters', () => {
    const longMessage = 'A'.repeat(1001);

    // sent to channel
    expect(requestMessageShare(user1.token, ogMessageIdChannel, longMessage, channelId, -1)).toStrictEqual(400);

    // sent to dm
    expect(requestMessageShare(user1.token, ogMessageIdDm, longMessage, -1, dmId)).toStrictEqual(400);
  });

  // SUCCESSFUL CASES
  test('share message successfully to channel', () => {
    const result = requestMessageShare(user1.token, ogMessageIdChannel, message, channelId, -1);
    expect(typeof result.sharedMessageId).toBe('number');
  });

  test('share message successfully to DM', () => {
    const result = requestMessageShare(user1.token, ogMessageIdDm, message, -1, dmId);
    expect(typeof result.sharedMessageId).toBe('number');
  });

  test('share message without optional message to channel', () => {
    const result = requestMessageShare(user1.token, ogMessageIdChannel, '', channelId, -1);
    expect(typeof result.sharedMessageId).toBe('number');
  });

  test('share message without optional message to DM', () => {
    const result = requestMessageShare(user1.token, ogMessageIdDm, '', -1, dmId);
    expect(typeof result.sharedMessageId).toBe('number');
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For message/sendlaterdm/v1      ///////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('test for message/sendlaterdm/v1', () => {
  let ownerDM, recieverDM, dmId1;
  beforeEach(() => {
    // Create an owner DM and a reciever DM
    ownerDM = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    recieverDM = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    // Channel
    dmId1 = requestDmCreate(ownerDM.token, [recieverDM.authUserId]).dmId;
  });
  // Error case
  // 400
  test('dmId does not refer to a valid DM', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(ownerDM.token, dmId1 + 1000, 'hi', currentTime + 5)).toStrictEqual(400);
  });
  test('length of message is less than 1 characters', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(ownerDM.token, dmId1, '', currentTime + 1)).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const longString = 'iIagf0VASUQE5aor2aiMLRtp17H9WXGzuSv2za0w68At2KBpGW4ZxZjJaNQgOIlFH3jWG5hJYhkZ7kTja40lylS5v1lqLyqF63zUIp1aKiXO0NtRPbZtUmb9EpjLMyhXXkQRfSgKUyeixjdqnCGAuL4EKP9kMxio9mKXDcSEvx6AXtrtGQeTd3bh1MOLjE03BVNA9sj1gnwxtwLPiUXmfchRXaf6iPxPirinJq3Jy85VMXIhlYWyQmbgkEMKGV9MqJqFi0wZxHpcyqtpG9qsm5khJmYJraAX1FIUOEd721SScDmTH3IxyC3lEujoPhWuhwE76KLm0YFAGgWnN6xG7GUr1JAcHxO1KxwvhGOumCw44AyS3w0THDwarTv2PlK6Hj43YV9VSwiTheAUd7DGrK5TSlxZFN4BCjOCMOHIAmGoZulsLNkQQce6it32BjoQwEqd3EG6oSO0ZFeXp4NKtJtO1jtCcgjwDnmudcZ9kLiOJvBcLicHeBQ5vPThyqnPYFT1xfjeteMxeaw87dIdAikeKd9P5gHlwZyKQIRPgKM0gQ6OJaB7631JiozhYdIOnno0YP52zg1gJLQqE3TryDF5tUlbLc5SuCBSPVTUCHzs6kENRIqFtoQTl9apM8JPcumh3TpBPIBjKUJOgCEowUJO9ZuMNjXLdQCnn5Yi5pOT2Po9aMRLoB5dz1KhZEPtGVLj0I8sHcYb7lLlR2jvuXZkrOLQ6kFuiKSMSmVbHmRZHqRWnGq5TXBjaHQBAT3JYg3mR5D3mK10EWuveJDlCC4AJGF6NnMstc0ZV4KkIQkP0dyvSIyF3NH6w1mIkQ7rBwVTYu7wfCRqh5Z6PSaAqlFo9BpfBUZ0kGLb4weBivxHQlXdgJlLJKrT41XaJmeNBRRMLP7I3LM9TtGfRYuLd2dtAWW2WpgkByJD0FOdP1AeJ87K4wNYWPirnaO1EiCYc87UIRpIINgBW1lWCItT7GUdnXZgYMirVh19Xsb0dssssssssssss';
    expect(requestSendLaterDM(ownerDM.token, dmId1, longString, currentTime + 1)).toStrictEqual(400);
  });
  test('timeSent is a time in the past', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(ownerDM.token, dmId1, 'hi', currentTime - 5)).toStrictEqual(400);
  });

  // 403 Error
  test('dmId is valid and the authorised user is not a member of the DM they are trying to post to', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const user = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'jim');
    expect(requestSendLaterDM(user.token, dmId1, 'hi', currentTime + 1)).toStrictEqual(403);
  });

  // Correct output
  test('Correct output - owner sending message across channel ', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(ownerDM.token, dmId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
    await sleep(1);
  });
  test('Correct output - DM member sending message across dm', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(recieverDM.token, dmId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });

    await sleep(1);
  });

  test('Correct output - sending the message directly afterwards', async () => {
    const currentTime = Math.floor(Date.now() / 1000);
    expect(requestSendLaterDM(ownerDM.token, dmId1, 'hi', currentTime + 1)).toStrictEqual({
      messageId: expect.any(Number),
    });
  });
});
