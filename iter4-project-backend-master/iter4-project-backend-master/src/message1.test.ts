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
  requestMessageRemove,
  requestMessageReact,
  requestMessageUnreact,
  requestSearch,
} from './FunctionForTest';

beforeEach(() => {
  requestClear();
});
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////           Tests For messageSendV1          ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Tests for /message/send/v1', () => {
  let owner, channelId, message;
  beforeEach(async () => {
    // Create 1 user, and create their own channel
    owner = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    channelId = requestChannelsCreate(owner.token, 'channel1', true).channelId;
    message = 'test';
  });

  // 400 case 1 - channelId does not refer to a valid channel
  test('non valid channelId', async () => {
    expect(await requestMessageSend(owner.token, channelId + 1, message)).toStrictEqual(400);
  });

  // 400 case 2 - length of message is less than 1 characters
  test('length of message is less than 1 characters', () => {
    const shortMessage = '';
    expect(requestMessageSend(owner.token, channelId, shortMessage)).toStrictEqual(400);
  });

  // 400 case 3 - length of message is over 1000 characters
  test('length of message is over 1000 characters', () => {
    const longMessage = 'a'.repeat(1001);
    expect(requestMessageSend(owner.token, channelId, longMessage)).toStrictEqual(400);
  });

  // 400 case 4 - channelId is valid and the authorised user is not a member of the channel
  test('Valid channel, user not a member of the channel', () => {
    const random = requestAuthRegister('person3@gmail.com', 'password', 'person3', 'bob');
    expect(requestMessageSend(random.token, channelId, message)).toStrictEqual(400);
  });

  // 400 case 5 - token is invalid
  test('non valid token', () => {
    expect(requestMessageSend(owner.token + 1, channelId, message)).toStrictEqual(403);
  });

  // Correct output, waiting for implementation
  test('Correct Output', () => {
    const msgId = requestMessageSend(owner.token, channelId, message);
    const msg = requestChannelMessages(owner.token, channelId, 0);
    expect(msg).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: msgId.messageId,
          uId: owner.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });

  test('4 messages by 4 different people + 1 from owner at the end', () => {
    // Add more messages by more people (4 people)
    const msgId = requestMessageSend(owner.token, channelId, message);
    const member2 = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'bob');
    const member3 = requestAuthRegister('test3@gmail.com', 'password', 'person3', 'bob');
    const member4 = requestAuthRegister('test4@gmail.com', 'password', 'person4', 'bob');
    requestChannelJoin(member2.token, channelId);
    requestChannelJoin(member3.token, channelId);
    requestChannelJoin(member4.token, channelId);

    const message2 = 'hello im new to this channel1!';
    const message3 = 'hello im new to this channel2!';
    const message4 = 'hello im new to this channel3!';
    const message5 = 'final wrap up message';

    const msgId2 = requestMessageSend(member2.token, channelId, message2);
    const msgId3 = requestMessageSend(member3.token, channelId, message3);
    const msgId4 = requestMessageSend(member4.token, channelId, message4);
    const msgId5 = requestMessageSend(owner.token, channelId, message5);

    const finalMessage = requestChannelMessages(member4.token, channelId, 0);

    expect(finalMessage).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: msgId.messageId,
          uId: owner.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId2.messageId,
          uId: member2.authUserId,
          message: 'hello im new to this channel1!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId3.messageId,
          uId: member3.authUserId,
          message: 'hello im new to this channel2!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId4.messageId,
          uId: member4.authUserId,
          message: 'hello im new to this channel3!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId5.messageId,
          uId: owner.authUserId,
          message: 'final wrap up message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]),
      start: 0,
      end: -1,
    });
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For requestMessageEditV1          ////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('tests for /message/edit/v1 - channels ver', () => {
  let user, channel, message;
  beforeEach(() => {
    user = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'harry', 'potter');
    channel = requestChannelsCreate(user.token, 'hogwarts', true);
    message = requestMessageSend(user.token, channel.channelId, 'hi');
  });

  test('message too long', () => {
    const longMessage = 'a'.repeat(1001);
    expect(requestMessageEdit(user.token, message.messageId, longMessage)).toStrictEqual(400);
  });

  test('messageId invalid', () => {
    expect(requestMessageEdit(user.token, message.messageId + 1, 'bye')).toStrictEqual(400);
  });

  test('token invalid - not sent by user', () => {
    const u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    requestChannelJoin(u1.token, channel.channelId);
    expect(requestMessageEdit(u1.token, message.messageId, 'bye')).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(requestMessageEdit(user.token + 2, message.messageId, 'bye')).toStrictEqual(403);
  });

  test('short message', () => {
    requestMessageEdit(user.token, message.messageId, '');

    const msg = requestChannelMessages(user.token, channel.channelId, 0);
    expect(msg).toEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  // User = 'Harry Potter'
  // Channel = 'hogwarts'
  //            - Harry Potter: hi
  //            - Ron Weasley: ron here!
  // User1 = 'Ron Weasley'

  test('short message with existing message inside', () => {
    const u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    requestChannelJoin(u1.token, channel.channelId);
    const msg2 = requestMessageSend(u1.token, channel.channelId, 'ron here!');

    // OWNERS MESSAGE TO BE DELETED
    requestMessageEdit(user.token, message.messageId, '');

    const msg = requestChannelMessages(user.token, channel.channelId, 0);
    expect(msg).toStrictEqual({
      messages: [
        {
          messageId: msg2.messageId,
          uId: u1.authUserId,
          message: 'ron here!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ],
      start: 0,
      end: -1,
    });
  });
  test('global owner - edit sucessful', () => {
    const u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    const c2 = requestChannelsCreate(u1.token, 'slytherin', true);
    const m2 = requestMessageSend(u1.token, c2.channelId, 'welcome');
    expect(requestMessageEdit(user.token, m2.messageId, 'hello!')).toStrictEqual({});
    const msg = requestChannelMessages(u1.token, c2.channelId, 0);
    expect(msg).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: m2.messageId,
          uId: u1.authUserId,
          message: 'hello!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });
  test('edit message correctly - normal permission', () => {
    // normal user
    const u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    requestChannelJoin(u1.token, channel.channelId);
    const m2 = requestMessageSend(u1.token, channel.channelId, 'welcome');
    expect(requestMessageEdit(user.token, m2.messageId, 'hello!')).toStrictEqual({});
    const msg = requestChannelMessages(u1.token, channel.channelId, 1);

    expect(msg).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: m2.messageId,
          uId: u1.authUserId,
          message: 'hello!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 1,
      end: -1,
    });
  });

  test('edit message correctly - channel owner', () => {
    const u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    const c2 = requestChannelsCreate(u1.token, 'slytherin', true);
    const u2 = requestAuthRegister('wingardium@email.com', 'leviosa', 'hermione', 'granger');
    requestChannelJoin(u2.token, c2.channelId);
    const m2 = requestMessageSend(u2.token, c2.channelId, 'hihiih');
    expect(requestMessageEdit(u1.token, m2.messageId, 'shush!')).toStrictEqual({});
    const msg = requestChannelMessages(u1.token, c2.channelId, 0);
    expect(msg).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: m2.messageId,
          uId: u2.authUserId,
          message: 'shush!',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });
});

describe('tests for /message/edit/v1 - dm ver', () => {
  let user, dm, message, u1, u2, m1;
  // user is global owner, u1 is dm owner, u2 is just normal
  beforeEach(() => {
    user = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'harry', 'potter');
    u1 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    u2 = requestAuthRegister('wingardium@gmail.com', 'leviosa', 'hermione', 'granger');
    dm = requestDmCreate(u1.token, [user.authUserId, u2.authUserId]);
    message = requestMessageSendDm(user.token, dm.dmId, 'hi');
    m1 = requestMessageSendDm(u2.token, dm.dmId, 'so tired');
  });

  // User = 'harry potter'
  // U1 = 'ron weasley'
  // U2 = 'hermoine granger'
  // DM = Owner: ron weasley
  //    = Members: harry potter, hermoine granger

  // Messages:
  //    - harry potter: 'hi'
  //    - 'hermoine granger': 'so tired'

  test('valid - dm owner', () => {
    requestMessageEdit(u1.token, message.messageId, 'bye');

    expect(requestDmMessages(u2.token, dm.dmId, 0)).toStrictEqual({
      messages: expect.arrayContaining([
        {
          messageId: message.messageId,
          uId: user.authUserId,
          message: 'bye',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: m1.messageId,
          uId: u2.authUserId,
          message: 'so tired',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]),
      start: 0,
      end: -1,
    });
  });

  // Messages:
  //    - harry potter: 'hi'
  //    - 'hermoine granger': 'so tired'

  // user is the global owner

  // Global owner, cannot edit a message
  test('valid - global owner cannot edit a message', () => {
    const ret = requestMessageEdit(user.token, m1.messageId, 'editFAIL');
    expect(ret).toStrictEqual(400);
    expect(requestDmMessages(u1.token, dm.dmId, 0)).toStrictEqual({

      messages: expect.arrayContaining([
        {
          messageId: message.messageId,
          uId: user.authUserId,
          message: 'hi',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: m1.messageId,
          uId: u2.authUserId,
          message: 'so tired',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });

  test('valid - new message is empty', () => {
    requestMessageEdit(user.token, message.messageId, '');
    expect(requestDmMessages(user.token, dm.dmId, 0)).toStrictEqual({
      messages: [
        {
          messageId: m1.messageId,
          uId: u2.authUserId,
          message: 'so tired',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ],
      start: 0,
      end: -1,
    });
    requestMessageEdit(u1.token, m1.messageId, '');
    expect(requestDmMessages(u2.token, dm.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('valid - normal permission', () => {
    requestMessageEdit(u2.token, m1.messageId, 'need sleep');

    // u.2 (member) can edit their own message m1
    expect(requestDmMessages(u2.token, dm.dmId, 0)).toStrictEqual({
      messages: [
        {
          messageId: m1.messageId,
          uId: u2.authUserId,
          message: 'need sleep',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: message.messageId,
          uId: user.authUserId,
          message: 'hi',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ],
      start: 0,
      end: -1,
    });

    //  normal user cant edit the message by someone else in dm
    expect(requestMessageEdit(u2.token, message.messageId, 'bye')).toStrictEqual(400);
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/senddm/v1          ///////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Tests for /message/senddm/v1', () => {
  let ownerDM, recieverDM, CreatedDM, message;
  beforeEach(() => {
    // Create an owner DM and a reciever DM
    ownerDM = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    recieverDM = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    // Whatever the created DM is named (NEEDS IMPLEMENTATION)
    CreatedDM = requestDmCreate(ownerDM.token, [recieverDM.authUserId]);
    message = 'test';
  });
  // 400 case 1 - dmId does not refer to a valid DM
  test('dmId does not refer to a valid DM', () => {
    expect(requestMessageSendDm(ownerDM.token, CreatedDM.dmId + 1, message)).toStrictEqual(400);
  });

  // 400 case 2.1 - length of message is less than 1 characters
  test('length of message is less than 1 characters', () => {
    const shortMessage = '';
    expect(requestMessageSendDm(ownerDM.token, CreatedDM.dmId, shortMessage)).toStrictEqual(400);
  });

  // 400 case 2.2 - length of message is over 1000 characters
  test('length of message is over 1000 characters', () => {
    const longMessage = 'a'.repeat(1001);
    expect(requestMessageSendDm(ownerDM.token, CreatedDM.dmId, longMessage)).toStrictEqual(400);
  });

  // 400 case 3 - dmId is valid and the authorised user is not a member of the DM
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const randomuser = requestAuthRegister('random1231@gmail.com', 'password', 'random', 'bob');
    expect(requestMessageSendDm(randomuser.token, CreatedDM.dmId, message)).toStrictEqual(400);
  });

  // 400 case 4 - token is invalid
  test('invalid token', () => {
    expect(requestMessageSendDm(ownerDM.token + 1, CreatedDM.dmId, message)).toStrictEqual(403);
  });

  // VALID CASES
  test('Correct Output', () => {
    const msgId = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, message);
    expect(msgId.messageId).toEqual(expect.any(Number));

    const ret = requestDmMessages(ownerDM.token, CreatedDM.dmId, 0);
    expect(ret).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: msgId.messageId,
          uId: ownerDM.authUserId,
          message: 'test',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });

  test('4 messages by 4 different people + 1 from owner at the end', () => {
    const recieverDM2 = requestAuthRegister('test3@gmail.com', 'password', 'person3', 'mayweather');
    const recieverDM3 = requestAuthRegister('test4@gmail.com', 'password', 'person4', 'mayweather');

    CreatedDM = requestDmCreate(ownerDM.token, [recieverDM.authUserId, recieverDM2.authUserId, recieverDM3.authUserId]);

    const msgId1 = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, 'test1');
    expect(msgId1.messageId).toEqual(expect.any(Number));

    const msgId2 = requestMessageSendDm(recieverDM.token, CreatedDM.dmId, 'test2');
    expect(msgId2.messageId).toEqual(expect.any(Number));

    const msgId3 = requestMessageSendDm(recieverDM2.token, CreatedDM.dmId, 'test3');
    expect(msgId2.messageId).toEqual(expect.any(Number));

    const msgId4 = requestMessageSendDm(recieverDM3.token, CreatedDM.dmId, 'test4');
    expect(msgId2.messageId).toEqual(expect.any(Number));

    const msgId5 = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, 'Owner Returning');
    expect(msgId2.messageId).toEqual(expect.any(Number));

    const ret = requestDmMessages(ownerDM.token, CreatedDM.dmId, 0);
    expect(ret).toEqual({
      messages: expect.arrayContaining([
        {
          messageId: msgId1.messageId,
          uId: ownerDM.authUserId,
          message: 'test1',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId2.messageId,
          uId: recieverDM.authUserId,
          message: 'test2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId3.messageId,
          uId: recieverDM2.authUserId,
          message: 'test3',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId4.messageId,
          uId: recieverDM3.authUserId,
          message: 'test4',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: msgId5.messageId,
          uId: ownerDM.authUserId,
          message: 'Owner Returning',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]),
      start: 0,
      end: -1,
    });
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For requestMessageRemove         ///////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////

// need requestMessageSendDm requestMessageRemove  requestDmMessagesV1
describe('Tests for /message/remove/v1', () => {
  let ownerDM, recieverDM, CreatedDM, message, mId, result, channelId;
  beforeEach(() => {
    // Create an owner DM and a reciever DM
    ownerDM = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    recieverDM = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    // Whatever the created DM is named (NEEDS IMPLEMENTATION)
    CreatedDM = requestDmCreate(ownerDM.token, [recieverDM.authUserId]);
    message = 'test';
    // Channel
    channelId = requestChannelsCreate(ownerDM.token, 'channel1', true).channelId;
  });

  // 400 Case
  test('failed: messageId does not refer to a valid message for dms', () => {
    mId = requestMessageSendDm(ownerDM.token, CreatedDM.dmId + 1, message);
    result = requestMessageRemove(ownerDM.token, mId + 1);
    expect(result).toEqual(400);
  });
  test('failed: messageId does not refer to a valid message for channels', () => {
    mId = requestMessageSend(ownerDM.token, channelId + 1, message);
    result = requestMessageRemove(ownerDM.token, mId + 1);
    expect(result).toEqual(400);
  });

  test('failed: token is invalid', () => {
    mId = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, message);
    result = requestMessageRemove(ownerDM.token + 1, mId);
    expect(result).toEqual(403);
  });

  // below tests need looking at potentially shouldnt be returning 403
  test('failed: message was not sent by the authorised user for dms ', () => {
    const person = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');
    mId = requestMessageSendDm(recieverDM.token, CreatedDM.dmId, message);
    result = requestMessageRemove(person.token, mId);
    expect(result).toEqual(403);
  });
  test('failed: message was not sent by the authorised user for channels ', () => {
    const person = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');
    mId = requestMessageSend(recieverDM.token, channelId, message);
    result = requestMessageRemove(person.token, mId);
    expect(result).toEqual(403);
  });

  // Correct outputs
  test('correct test for dm ', () => {
    mId = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, message);
    result = requestMessageRemove(ownerDM.token, mId.messageId);
    expect(result).toEqual({});
    mId = requestMessageSendDm(ownerDM.token, CreatedDM.dmId, message);
    const msg = requestDmMessages(ownerDM.token, CreatedDM.dmId, 0).messages;
    expect(msg).toStrictEqual([{
      messageId: mId.messageId,
      uId: ownerDM.authUserId,
      message: 'test',
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    }]);
  });

  test('correct test for channel ', () => {
    mId = requestMessageSend(ownerDM.token, channelId, message);
    result = requestMessageRemove(ownerDM.token, mId.messageId);
    expect(result).toEqual({});

    mId = requestMessageSend(ownerDM.token, channelId, message);
    const msg = requestChannelMessages(ownerDM.token, channelId, 0).messages;
    expect(msg).toStrictEqual([{
      messageId: mId.messageId,
      uId: ownerDM.authUserId,
      message: 'test',
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    }]);
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For requestSearch        //////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Tests for search/v1', () => {
  let ownerDM, recieverDM, output1, output2, output3;
  beforeEach(() => {
    // Create an owner DM and a reciever DM
    ownerDM = requestAuthRegister('test1@gmail.com', 'password', 'person1', 'bob');
    recieverDM = requestAuthRegister('test2@gmail.com', 'password', 'person2', 'mayweather');

    // Whatever the created DM is named
    const CreatedDM1 = requestDmCreate(ownerDM.token, [recieverDM.authUserId]);
    const CreatedDM2 = requestDmCreate(ownerDM.token, [recieverDM.authUserId]);
    const CreatedDM3 = requestDmCreate(ownerDM.token, [recieverDM.authUserId]);
    // Channel
    const channelId1 = requestChannelsCreate(ownerDM.token, 'channel1', true).channelId;
    const channelId2 = requestChannelsCreate(ownerDM.token, 'channel2', true).channelId;
    const channelId3 = requestChannelsCreate(ownerDM.token, 'channel3', true).channelId;
    // sending the message
    const msg1 = requestMessageSendDm(ownerDM.token, CreatedDM1.dmId, 'test').messageId;
    const msg2 = requestMessageSendDm(ownerDM.token, CreatedDM2.dmId, 'test1').messageId;
    const msg3 = requestMessageSendDm(ownerDM.token, CreatedDM3.dmId, 'this is fine').messageId;
    requestMessageSend(ownerDM.token, channelId1, 'house on fire');
    requestMessageSend(ownerDM.token, channelId2, 'dog');
    const msg6 = requestMessageSend(ownerDM.token, channelId3, 'cat').messageId;

    output1 = [
      {
        messageId: msg2,
        uId: ownerDM.authUserId,
        message: 'test1',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      },
      {
        messageId: msg1,
        uId: ownerDM.authUserId,
        message: 'test',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }];

    output2 = [{
      messageId: msg6,
      uId: ownerDM.authUserId,
      message: 'cat',
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    }];

    output3 = [{
      messageId: msg3,
      uId: ownerDM.authUserId,
      message: 'this is fine',
      timeSent: expect.any(Number),
      reacts: [],
      isPinned: false
    }];
  });
  // 400 Error
  test('query string less than 1 character', () => {
    expect(requestSearch(ownerDM.token, '')).toEqual(400);
  });
  test('query string more than 1000 character', () => {
    const longString = 'iIagf0VASUQE5aor2aiMLRtp17H9WXGzuSv2za0w68At2KBpGW4ZxZjJaNQgOIlFH3jWG5hJYhkZ7kTja40lylS5v1lqLyqF63zUIp1aKiXO0NtRPbZtUmb9EpjLMyhXXkQRfSgKUyeixjdqnCGAuL4EKP9kMxio9mKXDcSEvx6AXtrtGQeTd3bh1MOLjE03BVNA9sj1gnwxtwLPiUXmfchRXaf6iPxPirinJq3Jy85VMXIhlYWyQmbgkEMKGV9MqJqFi0wZxHpcyqtpG9qsm5khJmYJraAX1FIUOEd721SScDmTH3IxyC3lEujoPhWuhwE76KLm0YFAGgWnN6xG7GUr1JAcHxO1KxwvhGOumCw44AyS3w0THDwarTv2PlK6Hj43YV9VSwiTheAUd7DGrK5TSlxZFN4BCjOCMOHIAmGoZulsLNkQQce6it32BjoQwEqd3EG6oSO0ZFeXp4NKtJtO1jtCcgjwDnmudcZ9kLiOJvBcLicHeBQ5vPThyqnPYFT1xfjeteMxeaw87dIdAikeKd9P5gHlwZyKQIRPgKM0gQ6OJaB7631JiozhYdIOnno0YP52zg1gJLQqE3TryDF5tUlbLc5SuCBSPVTUCHzs6kENRIqFtoQTl9apM8JPcumh3TpBPIBjKUJOgCEowUJO9ZuMNjXLdQCnn5Yi5pOT2Po9aMRLoB5dz1KhZEPtGVLj0I8sHcYb7lLlR2jvuXZkrOLQ6kFuiKSMSmVbHmRZHqRWnGq5TXBjaHQBAT3JYg3mR5D3mK10EWuveJDlCC4AJGF6NnMstc0ZV4KkIQkP0dyvSIyF3NH6w1mIkQ7rBwVTYu7wfCRqh5Z6PSaAqlFo9BpfBUZ0kGLb4weBivxHQlXdgJlLJKrT41XaJmeNBRRMLP7I3LM9TtGfRYuLd2dtAWW2WpgkByJD0FOdP1AeJ87K4wNYWPirnaO1EiCYc87UIRpIINgBW1lWCItT7GUdnXZgYMirVh19Xsb0dssssssssssss';
    expect(requestSearch(ownerDM.token, longString)).toEqual(400);
  });

  // Correct outputs

  test('correct output -> input: test', () => {
    expect(requestSearch(ownerDM.token, 'test')).toMatchObject({
      messages: output1,
    });
  });

  test('correct output -> input: a', () => {
    expect(requestSearch(ownerDM.token, 'a')).toStrictEqual({
      messages: output2,
    });
  });

  test('correct output -> input: exact match', () => {
    expect(requestSearch(ownerDM.token, 'this is fine')).toStrictEqual({
      messages: output3,
    });
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/react/v1        //////////////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('/message/react/v1', () => {
  let user1, user2, user3, channel, m1, m2, dm;
  beforeEach(async () => {
    user1 = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'harry', 'potter');
    user2 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    user3 = requestAuthRegister('wingardium@gmail.com', 'leviosa', 'hermione', 'granger');
    channel = requestChannelsCreate(user1.token, 'hogwarts', true);

    // Hogwarts (public)
    //    - User1: 'hi'

    // DMS - (User1 + User2)
    //    -User2: 'helloe'

    m1 = requestMessageSend(user1.token, channel.channelId, 'hi');
    dm = requestDmCreate(user1.token, [user2.authUserId]);
    m2 = requestMessageSendDm(user2.token, dm.dmId, 'helloe');
  });

  // 403 Error, token does not exist
  test('invalid token - user does not exist', () => {
    expect(requestMessageReact(user3.token + 100, m1.messageId, 1)).toStrictEqual(403);
  });

  test('invalid messageId - user in channel, message not found in channel', () => {
    expect(requestMessageReact(user1.token, m1.messageId + 1000, 1)).toStrictEqual(400);
  });

  test('valid messageId - user not in dm, user not in channel', () => {
    expect(requestMessageReact(user3.token, m1.messageId, 1)).toStrictEqual(400);
    expect(requestMessageReact(user3.token, m2.messageId, 1)).toStrictEqual(400);
  });

  test('invalid reactId', () => {
    expect(requestMessageReact(user1.token, m1.messageId, 500)).toStrictEqual(400);
  });

  test('message is already reacted by user1', () => {
    expect(requestMessageReact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user1.token, m1.messageId, 1)).toStrictEqual(400);
    expect(requestMessageReact(user2.token, m2.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user2.token, m2.messageId, 1)).toStrictEqual(400);
  });

  test('valid input & react', () => {
    expect(requestMessageReact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user2.token, m2.messageId, 1)).toStrictEqual({});

    const channelMsg = requestChannelMessages(user1.token, channel.channelId, 0);
    expect(channelMsg).toStrictEqual({
      messages: [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId],
          isThisUserReacted: true,
        }],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });

    const dmMsg = requestDmMessages(user2.token, dm.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user2.authUserId],
          isThisUserReacted: true,
        }],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });

    expect(requestMessageReact(user1.token, m2.messageId, 1)).toStrictEqual({});
    const dmMsg2 = requestDmMessages(user1.token, dm.dmId, 0);
    expect(dmMsg2).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user2.authUserId, user1.authUserId],
          isThisUserReacted: true,
        }],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
  });

  test('valid react - owner', () => {
    expect(requestMessageReact(user1.token, m2.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]
    );

    expect(requestDmMessages(user1.token, dm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId],
          isThisUserReacted: true,
        }],
        isPinned: false
      }]
    );
  });

  test('valid react - multiple member of channel', () => {
    const user4 = requestAuthRegister('test4@gmail.com', 'sekjrsljerlks', 'test4', 'password4');
    requestChannelJoin(user3.token, channel.channelId);
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user4.token, channel.channelId);

    expect(requestMessageReact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user2.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user3.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestChannelMessages(user3.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestChannelMessages(user2.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestChannelMessages(user4.token, channel.channelId, 0).messages).toStrictEqual(
      [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: false
        }],
        isPinned: false
      }]
    );
  });

  test('valid react - multiple member of dm', () => {
    const user4 = requestAuthRegister('test4@gmail.com', 'sekjrsljerlks', 'test4', 'password4');
    const testDm = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId, user4.authUserId]);
    const m3 = requestMessageSendDm(user3.token, testDm.dmId, 'test3');

    expect(requestMessageReact(user1.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user2.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestMessageReact(user3.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestDmMessages(user3.token, testDm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m3.messageId,
        uId: user3.authUserId,
        message: 'test3',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestDmMessages(user2.token, testDm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m3.messageId,
        uId: user3.authUserId,
        message: 'test3',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestDmMessages(user1.token, testDm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m3.messageId,
        uId: user3.authUserId,
        message: 'test3',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }]
    );
    expect(requestDmMessages(user4.token, testDm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m3.messageId,
        uId: user3.authUserId,
        message: 'test3',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId, user2.authUserId, user3.authUserId],
          isThisUserReacted: false
        }],
        isPinned: false
      }]
    );
  });
});

/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////           Tests For /message/unreact/v1          //////////////////////////////
/// //////////////////////////////////////////////////////////////////////////////////////////////////////////
describe('/message/unreact/v1', () => {
  let user1, user2, user3, channel, m1, m2, dm;
  beforeEach(() => {
    user1 = requestAuthRegister('lumos@gmail.com', 'sekjrsljerlks', 'harry', 'potter');
    user2 = requestAuthRegister('expecto@gmail.com', 'patronum', 'ron', 'weasley');
    user3 = requestAuthRegister('wingardium@gmail.com', 'leviosa', 'hermione', 'granger');
    channel = requestChannelsCreate(user1.token, 'hogwarts', true);
    m1 = requestMessageSend(user1.token, channel.channelId, 'hi');
    dm = requestDmCreate(user1.token, [user2.authUserId]);
    m2 = requestMessageSendDm(user2.token, dm.dmId, 'helloe');

    // Hogwarts (public)
    //    - User1: 'hi' (REACTED)

    // DMS - (User1 + User2)
    //    -User2: 'helloe' (REACTED)

    requestMessageReact(user1.token, m1.messageId, 1);
    requestMessageReact(user2.token, m2.messageId, 1);
  });

  // 403 Error, token does not exist
  test('invalid token - user does not exist', () => {
    expect(requestMessageUnreact(user3.token + 100, m1.messageId, 1)).toStrictEqual(403);
  });

  test('invalid messageId - message doesnt exist', () => {
    expect(requestMessageUnreact(user1.token, m1.messageId + 1000, 1)).toStrictEqual(400);
  });

  test('valid messageId, user doesnt belong to either channel or dm', () => {
    expect(requestMessageUnreact(user3.token, m1.messageId, 1)).toStrictEqual(400);
    expect(requestMessageUnreact(user3.token, m2.messageId, 1)).toStrictEqual(400);
  });

  test('invalid reactId', () => {
    expect(requestMessageUnreact(user1.token, m1.messageId, 500)).toStrictEqual(400);
  });

  test('message is not reacted by user', () => {
    expect(requestMessageUnreact(user2.token, m1.messageId, 1)).toStrictEqual(400);
  });

  test('valid input & unreact - channels', () => {
    expect(requestMessageUnreact(user1.token, m1.messageId, 1)).toStrictEqual({});
    const channelMsg = requestChannelMessages(user1.token, channel.channelId, 0);
    expect(channelMsg).toStrictEqual({
      messages: [{
        messageId: m1.messageId,
        uId: user1.authUserId,
        message: 'hi',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
  });

  test('valid input & unreact - dms', () => {
    requestMessageReact(user1.token, m2.messageId, 1);
    const dmTest = requestDmMessages(user1.token, dm.dmId, 0);
    expect(dmTest).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user2.authUserId, user1.authUserId],
          isThisUserReacted: true
        }],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });

    expect(requestMessageUnreact(user2.token, m2.messageId, 1)).toStrictEqual({});
    let dmMsg = requestDmMessages(user2.token, dm.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [{
          reactId: 1,
          uIds: [user1.authUserId],
          isThisUserReacted: false
        }],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });

    expect(requestMessageUnreact(user1.token, m2.messageId, 1)).toStrictEqual({});
    dmMsg = requestDmMessages(user2.token, dm.dmId, 0);
    expect(dmMsg).toStrictEqual({
      messages: [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }],
      start: 0,
      end: -1,
    });
  });

  test('valid unreact - owner', () => {
    expect(requestMessageUnreact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnreact(user2.token, m2.messageId, 1)).toStrictEqual({});

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

    expect(requestDmMessages(user1.token, dm.dmId, 0).messages).toStrictEqual(
      [{
        messageId: m2.messageId,
        uId: user2.authUserId,
        message: 'helloe',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false
      }]
    );
  });

  test('valid react - multiple member of channel', () => {
    requestChannelJoin(user2.token, channel.channelId);
    requestChannelJoin(user3.token, channel.channelId);
    requestMessageUnreact(user1.token, m1.messageId, 1);
    const correct = requestChannelMessages(user1.token, channel.channelId, 0);
    requestMessageReact(user1.token, m1.messageId, 1);
    requestMessageReact(user2.token, m1.messageId, 1);
    requestMessageReact(user3.token, m1.messageId, 1);
    expect(requestMessageUnreact(user1.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnreact(user2.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnreact(user3.token, m1.messageId, 1)).toStrictEqual({});
    expect(requestChannelMessages(user1.token, channel.channelId, 0)).toStrictEqual(correct);
  });

  test('valid react - multiple member of dm', () => {
    const newDm = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]);
    const m3 = requestMessageSendDm(user3.token, newDm.dmId, 'this is the third dm');

    const correct = requestDmMessages(user1.token, newDm.dmId, 0);
    requestMessageReact(user1.token, m3.messageId, 1);
    requestMessageReact(user2.token, m3.messageId, 1);
    requestMessageReact(user3.token, m3.messageId, 1);
    expect(requestMessageUnreact(user1.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnreact(user2.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnreact(user3.token, m3.messageId, 1)).toStrictEqual({});
    expect(requestDmMessages(user1.token, newDm.dmId, 0)).toStrictEqual(correct);
  });
});
