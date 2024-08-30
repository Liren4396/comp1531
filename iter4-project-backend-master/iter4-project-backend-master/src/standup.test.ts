
import {
  requestClear,
  requestAuthRegister,
  requestChannelMessages,
  requestChannelsCreate,
  requestStandupStart,
  requestStandupActive,
  requestStandupSend,
  // requestSearch
} from './FunctionForTest';
beforeEach(() => {
  requestClear();
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For standupStart              /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data -- standupStart', () => {
  expect(requestStandupStart('1234567', 1, 5)).toStrictEqual(400);
});
describe('Tests For standupStart', () => {
  let person1, person2, channel1;
  beforeEach(() => {
    person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    person2 = requestAuthRegister('abc@123.com', 'Kkkkk4396', 'hello', 'world');
    channel1 = requestChannelsCreate(person1.token, 'mychannel1', true);
  });
  test('Test failed -- standupStart', () => {
    expect(requestStandupStart(person1.token + 1, channel1.channelId, 5)).toStrictEqual(403);
    expect(requestStandupStart(person1.token, channel1.channelId + 1, 5)).toStrictEqual(400);
    expect(requestStandupStart(person1.token, channel1.channelId, -5)).toStrictEqual(400);
    expect(requestStandupStart(person2.token, channel1.channelId, 5)).toStrictEqual(403);
    requestStandupStart(person1.token, channel1.channelId, 5);
    expect(requestStandupStart(person2.token, channel1.channelId, 5)).toStrictEqual(400);
  });
  test('Test successfully -- standupStart', () => {
    const timeNow = Math.floor(Date.now() / 1000);
    const timeStart = requestStandupStart(person1.token, channel1.channelId, 5).timeFinish;
    expect(timeStart).toBeGreaterThanOrEqual(timeNow);
  });
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For standupActive             /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
test('empty data -- standupActive', () => {
  expect(requestStandupActive('1234567', 1)).toStrictEqual(400);
});
describe('Tests For standupActive', () => {
  let person1, person2, channel1, channel2;
  beforeEach(() => {
    person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    person2 = requestAuthRegister('abc@123.com', 'Kkkkk4396', 'hello', 'world');
    channel1 = requestChannelsCreate(person1.token, 'mychannel1', true);
  });
  test('Test failed -- standupActive', () => {
    expect(requestStandupActive(person1.token + 1, channel1.channelId)).toStrictEqual(403);
    expect(requestStandupActive(person1.token, channel1.channelId + 1)).toStrictEqual(400);
    expect(requestStandupActive(person2.token, channel1.channelId)).toStrictEqual(403);
  });
  test('Test successfully -- standupActive', () => {
    channel2 = requestChannelsCreate(person1.token, 'mychannel2', true);
    const timeStart = requestStandupStart(person1.token, channel1.channelId, 5).timeFinish;
    const active1 = requestStandupActive(person1.token, channel1.channelId);
    expect(active1).toStrictEqual({
      isActive: true,
      timeFinish: timeStart
    });
    const active2 = requestStandupActive(person1.token, channel2.channelId);
    expect(active2).toStrictEqual({
      isActive: false,
      timeFinish: null
    });
  });
});
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Tests For standupSend               /////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms * 1000));
}
test('Test failed -- standupSend', async () => {
  expect(requestStandupSend('1234567', 1, '')).toStrictEqual(400);
});
describe('Tests For standupSend', () => {
  let person1, person2, channel1, msg;
  beforeEach(() => {
    person1 = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    person2 = requestAuthRegister('abc@123.com', 'Kkkkk4396', 'hello', 'world');
    channel1 = requestChannelsCreate(person1.token, 'mychannel1', true);
  });
  test('Test failed -- active doesnt run', async () => {
    expect(requestStandupSend(person1.token, channel1.channelId, 'a')).toStrictEqual(400);
    await sleep(1);
  });
  test('Test failed -- standupSend', async () => {
    expect(requestStandupSend(person1.token, channel1.channelId, '')).toStrictEqual(400);
    requestStandupStart(person1.token, channel1.channelId, 1);

    expect(requestStandupSend(person1.token, channel1.channelId, 'a'.repeat(1001))).toStrictEqual(400);
    expect(requestStandupSend(person1.token + 1, channel1.channelId, '')).toStrictEqual(403);
    expect(requestStandupSend(person1.token, channel1.channelId + 1, '123')).toStrictEqual(400);
    expect(requestStandupSend(person2.token, channel1.channelId, '123')).toStrictEqual(403);
    await sleep(1);
  });

  jest.setTimeout(10000);

  test('Test successfully -- standupSend', async () => {
    await sleep(1);
    requestStandupStart(person1.token, channel1.channelId, 5);
    requestStandupActive(person1.token, channel1.channelId);

    expect(requestStandupSend(person1.token, channel1.channelId, '1')).toStrictEqual({});
    expect(requestStandupSend(person1.token, channel1.channelId, '2')).toStrictEqual({});
    expect(requestStandupSend(person1.token, channel1.channelId, 'a'.repeat(962))).toStrictEqual({});
    await sleep(5);
    msg = requestChannelMessages(person1.token, channel1.channelId, 0);
    expect(msg).toStrictEqual({
      messages: expect.arrayContaining([
        {
          messageId: expect.any(Number),
          uId: person1.authUserId,
          message: 'lirending: 1\nlirending: 2\nlirending: ' + 'a'.repeat(962),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]),
      start: 0,
      end: -1,
    });
  });
});
