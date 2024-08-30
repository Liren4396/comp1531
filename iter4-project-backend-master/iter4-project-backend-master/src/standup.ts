import { getData, setData } from './dataStore';
import { existingChannel, isActiveStandup, isMember, isEmpty, tokenToUId, getHandleStr, updatemessageStat, updateWorkspacemessage } from './helpers';
import { messageSendV1 } from './message';
import HTTPError from 'http-errors';

/**
  * <Function that takes channelId and length of the standup and start the standup>
  *
  * @param {string} token - ID of the user
  * @param {number} channelId - The channelId
  * @param {number} length - length of the standup
  * ...
  *
  * @returns {timeFinish: number} - return when the standup will finish.
*/
export function standupStart(token: string, channelId: number, length: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  let data = getData();

  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  // userID from token
  const userId = tokenToUId(token).authorisedId;
  // Error checking
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId ');
  }
  if (length < 0) {
    throw HTTPError(400, 'negative length');
  }
  if (isActiveStandup(channelId)) {
    throw HTTPError(400, 'currently have a standup running ');
  }
  if (!isMember(userId, channelId)) {
    throw HTTPError(403, 'user not a valid member of the channel');
  }

  // setting standup as active
  let currChannel;
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      channel.isStandUpActive = true;
      currChannel = channel;
    }
  }
  // pushing finishing time into the array
  const currTime = Math.floor(Date.now() / 1000);
  currChannel.timeFinish = currTime + (length * 1000);
  setData(data);

  setTimeout(function() {
    // getting the data again since it would've been changed by standUp/send
    data = getData();
    for (const channel of data.channels) {
      if (channel.id === channelId) {
        currChannel = channel;
      }
    }
    const message = currChannel.buffer.join('\n');
    if (message.length < 1 || message.length > 1000) {
      return { timeFinish: currChannel.timeFinish };
    }
    if (isEmpty(tokenToUId(token))) {
      return { timeFinish: currChannel.timeFinish };
    }
    messageSendV1(token, channelId, message);

    // getting the data again since messageSend would have changed it
    data = getData();
    for (const channel of data.channels) {
      if (channel.id === channelId) {
        currChannel = channel;
      }
    }
    // setting the isActive and buffer to it's original state
    currChannel.isStandUpActive = false;
    currChannel.buffer = [];
    setData(data);
    updatemessageStat(userId, Math.floor(Date.now() / 1000));
    updateWorkspacemessage(Math.floor(Date.now() / 1000), true);
  }, length * 1000);

  return {
    timeFinish: currChannel.timeFinish,
  };
}
/**
  * <Function that checks whether a standUp is active or not>
  *
  * @param {string} token - ID of the user
  * @param {number} channelId - channelId
  * ...
  *
  * @returns {isActive: boolean, timeFinish: number|null,} - returns object containing isActive boolean and timeFinish as a number or null.
*/
export function standupActive(token: string, channelId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();

  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  // userID from token
  const userId = tokenToUId(token).authorisedId;
  // Error checking
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId ');
  }
  if (!isMember(userId, channelId)) {
    throw HTTPError(403, 'user not a valid member of the channel');
  }

  for (const channel of data.channels) {
    if (channel.id === channelId) {
      if (channel.isStandUpActive === true) {
        return {
          isActive: true,
          timeFinish: channel.timeFinish,
        };
      } else {
        return {
          isActive: false,
          timeFinish: null,
        };
      }
    }
  }
}
/**
  * <Function takes authUserId and uId as an input and outputs the user object for uId>
  *
  * @param {string} token - ID of the user
  * @param {number} channelId - The channelId
  * @param {string} message - the intended message for standup.
  * ...
  *
  * @returns {}
*/
export function standupSend(token: string, channelId: number, message: string) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();

  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  // userID from token
  const userId = tokenToUId(token).authorisedId;
  // Error checking
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId (standup send)');
  }
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  if (!isActiveStandup(channelId)) {
    throw HTTPError(400, ' currently not have a standup running ');
  }
  if (!isMember(userId, channelId)) {
    throw HTTPError(403, 'user not a valid member of the channel');
  }

  // concatenating the message string
  const suMessage = getHandleStr(userId) + ': ' + message;
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      channel.buffer.push(suMessage);
    }
  }
  setData(data);

  return {};
}
