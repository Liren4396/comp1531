import { getData, setData } from './dataStore';
import { messageReturnId, error, User, notification } from './interfaces';
import { hangmanStart, resetHangman, exitHangman, guessHanman } from './hangman';
import {
  existingMessage,
  existingDM,
  tokenToUId,
  isEmpty,
  isAuthorised,
  existingChannel,
  generateMessageId,
  isMember,
  pushTaggedNotification,
  isDmMember,
  isDmOrChannelOwner,
  isPinned,
  getHandleStr,
  addingNotifications,
  getMessageOwner,
  updateWorkspacemessage,
  updatemessageStat
} from './helpers';
import HTTPError from 'http-errors';

/**
  * Get the 20 most recent notifications for a specific user
  *
  * @param {token} token - authUser's unique token
  *
  * ...
  * @returns {notifications: notification[]} - The 20 most recent notifications
  *
  *
*/
// Nearly finished, waiting on unreact and react message
export function getNotification(token: string) {
  const data = getData();
  let returnArray: notification[] = [];
  const user = tokenToUId(token);

  if (JSON.stringify(user) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  const userId = user.authorisedId;
  for (const user of data.users) {
    if (user.uId === userId) {
      returnArray = user.notifications.slice(0, 20);
      break;
    }
  }
  return { notifications: returnArray };
}

// This file should have 4 functions
// 1) messageSendV1
// 2) messageEditV1
// 3) messageRemoveV1
// 4) requestMessageSendDmV1V1

/**
  * Send a message from authorised user to the DM specified by dmId.
  * Note: Each message should have its own unique ID,
  * i.e. no messages should share an ID with another message,
  * even if that other message is in a different channel.
  *
  * @param {token} token - authUser's unique token
  * @param {number} channelId - dm's unique id
  * @param {string} message - message to be sent
  * ...
  * @returns {messageId: number} - message's unique ID
  * @returns {object} - error
*/
export function messageSendV1(token: string, channelId: number, message: string): messageReturnId | error {
  let data = getData();
  // ERROR CASE: channelId does not refer to a valid DM
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  }

  // ERROR CASE: token is valid
  const auth = tokenToUId(token);
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }

  // ERROR CASE: length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }

  // ERROR CASE: channelId is valid and the authorised user is not a member of the channel
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      let flag = 0;
      for (const member of channel.allMembers) {
        if (member.uId === auth.authorisedId) {
          flag = 1;
          break;
        }
      }

      if (flag === 0) {
        throw HTTPError(400, 'channelId is valid and the authorised user is not a member of the channel');
      }
    }
  }

  // generate unique id
  const messageId = generateMessageId();
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      // checking for tagging, and then pushing a tagged notification into user's notification array;
      if (message.indexOf('@') !== -1) {
        data = pushTaggedNotification(message, true, channel.name, channelId, auth.authorisedId, data);
      }
      channel.messages.push({
        messageId: messageId,
        uId: auth.authorisedId,
        message: message,
        timeSent: Math.floor(Date.now() / 1000),
        reacts: [],
        isPinned: false
      });
    }
  }

  setData(data);
  if (message === '/hangman') {
    hangmanStart(token, channelId);
  } else if (message === '/reset') {
    resetHangman(token, channelId);
  } else if (message === '/exit') {
    exitHangman(token, channelId);
  } else if (message.startsWith('/guess ')) {
    guessHanman(token, channelId, message);
  }
  updatemessageStat(auth.authorisedId, Math.floor(Date.now() / 1000));
  updateWorkspacemessage(Math.floor(Date.now() / 1000), true);
  return { messageId: messageId };
}

// Given a message, update its text with new text. If the new message is an empty string, the message is deleted.
export function messageEditV1(token: string, messageId: number, message: string): object | error {
  // ERRORS:
  // CHECK - token is invalid
  // CHECK - length of message is over 1000 characters
  // messageId does not refer to a valid message within a channel/DM that the authorised user has joined
  // the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM

  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  let data = getData();

  // Check if the token and messageId exist
  const user = data.users?.find((user: User) => user.token.includes(token));
  const auth = tokenToUId(token);
  if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  } else if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  // Logic: loop through Channels then DMS to find the messageId
  let channelId, channelName;
  // Check Channels
  for (const channel of data.channels) {
    let messageCheck;

    for (const msg of channel.messages) {
      if (msg.messageId === messageId) {
        channelId = channel.id;
        channelName = channel.name;
        messageCheck = msg;
        break;
      }
    }

    if (messageCheck) {
      // Check permissions
      const ownerCheck = channel.ownerMembers.some((owner) => owner.uId === user.uId);
      const globalOwner = user.global_permission;

      if (messageCheck.uId !== user.uId && !ownerCheck && !globalOwner) {
        throw HTTPError(400, 'error');
      }

      // Update the message or delete it
      if (message === '') {
        channel.messages = channel.messages.filter((msg) => msg.messageId !== messageId);
      } else {
        messageCheck.message = message;
      }

      // checking for tagging, and then pushing a tagged notification into user's notification array;
      if (message.indexOf('@') !== -1) {
        data = pushTaggedNotification(message, true, channelName, channelId, auth.authorisedId, data);
      }
      setData(data);
      return {};
    }
  }

  // Check DMs
  let dmName, dmId;
  for (const dm of data.dms) {
    let messageCheck;

    for (const msg of dm.messages) {
      if (msg.messageId === messageId) {
        dmName = dm.name;
        dmId = dm.id;
        messageCheck = msg;
        break;
      }
    }

    if (messageCheck) {
      // Check permissions
      // const globalOwner = user.global_permission;
      const isDmCreator = dm.creatorId === user.uId;

      if (messageCheck.uId === user.uId || isDmCreator) {
        // Update the message or delete it
        if (message === '') {
          dm.messages = dm.messages.filter((msg) => msg.messageId !== messageId);
        } else {
          messageCheck.message = message;
        }
        if (message.indexOf('@') !== -1) {
          data = pushTaggedNotification(message, false, dmName, dmId, auth.authorisedId, data);
        }
      } else {
        throw HTTPError(400, 'permissions error');
      }
      setData(data);
      return {};
    }
  }

  // At this point, the messageId does not belong in either the DM or the Channel
  // return { error: 'ERROR 4' };
  throw HTTPError(400, 'the messageId does not belong in either the DM or the Channel');
}

/**
  * Send a message from authorised user to the DM specified by dmId.
  * Note: Each message should have it's own unique ID,
  * i.e. no messages should share an ID with another message,
  * even if that other message is in a different channel or DM.
  *
  * @param {token} token - authUser's unique token
  * @param {number} dmId - dm's unique id
  * @param {string} message - message to be sent
  * ...
  * @returns {messageId: number} - message's unique ID
  * @returns {object} - error
*/
export function messageSendDmV1(token: string, dmId: number, message: string): messageReturnId | error {
  let data = getData();

  // ERROR CASE: dmId does not refer to a valid DM
  if (!existingDM(dmId)) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }
  // ERROR CASE: token is valid
  const auth = tokenToUId(token);
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  // ERROR CASE: length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  // ERROR CASE: dmId is valid and the authorised user is not a member of the DM
  for (const dm of data.dms) {
    if (dm.id === dmId) {
      let flag = 0;
      for (const memberId of dm.memberId) {
        if (memberId === auth.authorisedId) {
          flag = 1;
          break;
        }
      }
      if (flag === 0) {
        throw HTTPError(400, 'dmId is valid and the authorised user is not a member of the DM');
      }
    }
  }
  // generate unique id
  const messageId = generateMessageId();
  // update info
  for (const dm of data.dms) {
    if (dm.id === dmId) {
      if (message.indexOf('@') !== -1) {
        data = pushTaggedNotification(message, false, dm.name, dmId, auth.authorisedId, data);
      }

      dm.messages.push({
        messageId: messageId,
        uId: auth.authorisedId,
        message: message,
        timeSent: Math.floor(Date.now() / 1000),
        reacts: [],
        isPinned: false
      });
    }
  }
  setData(data);
  updatemessageStat(auth.authorisedId, Math.floor(Date.now() / 1000));
  updateWorkspacemessage(Math.floor(Date.now() / 1000), true);
  return { messageId: messageId };
}

export function messageRemoveV1(token: string, messageId: number): object | error {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }

  const userId = tokenToUId(token).authorisedId;
  // checking whether the user is authorised to delete the message
  // ie. either the owner of te channel or the creator of the message
  if (!isAuthorised(userId, messageId)) {
    throw HTTPError(400, 'user is not authorised to delete the message');
  }
  // checking whether the user who sent the messages is deleting it
  if (!existingMessage(userId, messageId)) {
    throw HTTPError(400, 'messageId is not sent by the user');
  }
  for (const dm of data.dms) {
    let index = 0;
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        dm.messages.splice(index, 1);
      }
      index++;
    }
  }

  for (const dm of data.dms) {
    let index = 0;
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        dm.messages.splice(index, 1);
      }
      index++;
    }
  }
  for (const channel of data.channels) {
    let index = 0;
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        channel.messages.splice(index, 1);
      }
      index++;
    }
  }
  setData(data);
  updateWorkspacemessage(Math.floor(Date.now() / 1000), false);
  return {};
}

export function messageSearch(token: string, queryStr: string) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(400, 'fail to change uId to token');
  }
  const userId = tokenToUId(token).authorisedId;
  // length of queryStr is less than 1 or over 1000 characters
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'length of queryStr is less than 1 or over 1000 characters');
  }
  const returnMessage = [];
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.uId === userId && message.message.match(queryStr)) {
        returnMessage.push(message);
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.uId === userId && message.message.match(queryStr)) {
        returnMessage.push(message);
      }
    }
  }
  returnMessage.reverse();
  return { messages: returnMessage };
}

export function messageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(400, 'fail to change uId to token');
  }
  const userId = tokenToUId(token).authorisedId;
  // length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  // channelId does not refer to a valid channel
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  }
  // channelId is valid and the authorised user is not a member of the channel they are trying to post to
  if (!isMember(userId, channelId)) {
    throw HTTPError(403, 'nopt a member of channel');
  }
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime > timeSent) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  const newid = generateMessageId();
  setTimeout(function () {
    let data = getData();
    const newMessage = {
      messageId: newid,
      uId: userId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    for (const channel of data.channels) {
      if (channel.id === channelId) {
        channel.messages.push(newMessage);
        if (message.indexOf('@') !== -1) {
          data = pushTaggedNotification(message, true, channel.name, channelId, userId, data);
        }
        setData(data);
        updatemessageStat(userId, Math.floor(Date.now() / 1000));
        updateWorkspacemessage(Math.floor(Date.now() / 1000), true);
        break;
      }
    }
  }, (timeSent - currentTime) * 1000);
  return { messageId: newid };
}

export function DMmessageSendLater(token: string, dmId: number, message: string, timeSent: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(400, 'fail to change uId to token');
  }
  const userId = tokenToUId(token).authorisedId;
  // length of message is less than 1 or over 1000 characters
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  // dmId does not refer to a valid channel
  if (!existingDM(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }
  // dmId is valid and the authorised user is not a member of the DM they are trying to post to
  if (!isDmMember(userId, dmId)) {
    throw HTTPError(403, 'nopt a member of dm');
  }
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime > timeSent) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  const newid = generateMessageId();

  setTimeout(function () {
    if (!existingDM(dmId)) {
      throw HTTPError(400, 'DM is removed');
    }
    let data = getData();
    const newMessage = {
      messageId: newid,
      uId: userId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    for (const dm of data.dms) {
      if (dm.id === dmId) {
        dm.messages.push(newMessage);
        if (message.indexOf('@') !== -1) {
          data = pushTaggedNotification(message, false, dm.name, dmId, userId, data);
        }
        setData(data);
        updatemessageStat(userId, Math.floor(Date.now() / 1000));
        updateWorkspacemessage(Math.floor(Date.now() / 1000), true);
        break;
      }
    }
  }, (currentTime - timeSent) * 1000);
  return { messageId: newid };
}

/**
  * Given a message within a channel or DM the authorised user is part of, adds a "react" to that particular message.
  *
  * @param {token} token - authUser's unique token
  * @param {number} messageId - message's unique id
  * @param {number} reactId - react's id (1)
  * ...
  * @returns {object} - nothing
  * @returns {object} - error
*/
export function messageReactV1(token: string, messageId: number, reactId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  let data = getData();

  // checking for valid token
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'fail to change token to uId');
  }

  const userId = tokenToUId(token).authorisedId;

  // Validate reactId
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is not a valid react ID');
  }

  // LOGIC: Search thru Channels and DMS to find the message
  let foundMessage;
  let isAuthorized = false;
  let name, channelId, dmId;
  // Search the channels
  for (const channel of data.channels) {
    if (channel.allMembers.some((user: User) => user.uId === userId)) {
      foundMessage = channel.messages.find((msg) => msg.messageId === messageId);
      if (foundMessage) {
        isAuthorized = true;
        name = channel.name;
        channelId = channel.id;
        dmId = -1;
        break;
      }
    }
  }

  // Search the DMS
  if (!isAuthorized) {
    for (const dm of data.dms) {
      if (dm.memberId.includes(userId)) {
        foundMessage = dm.messages.find((msg) => msg.messageId === messageId);
        if (foundMessage) {
          isAuthorized = true;
          name = dm.name;
          channelId = -1;
          dmId = dm.id;
          break;
        }
      }
    }
  }

  if (!foundMessage || !isAuthorized) {
    throw HTTPError(400, 'Invalid messageId or unauthorized user');
  }

  // AT THIS POINT ADD THE REACT
  // Check if there's an existing react with the same reactId
  const existingReact = foundMessage.reacts.find((react) => react.reactId === reactId);

  if (existingReact) {
    // user has already reacted
    if (existingReact.uIds.includes(userId)) {
      throw HTTPError(400, 'The message already contains a react from this user');
    }

    // Add the user to the uId section of the existing react
    existingReact.uIds.push(userId);
  } else {
    // If there's no existing react with the same reactId, create a new react and push it to the reacts array
    foundMessage.reacts.push({ reactId: reactId, uIds: [userId] });
  }

  // Adding notification for react
  const messageOwner = getMessageOwner(messageId);
  if (isMember(messageOwner, channelId) || isDmMember(messageOwner, dmId)) {
    if (messageOwner !== userId) {
      const userHandle = getHandleStr(userId);
      const noteMessage = userHandle + ' reacted to your message in ' + name;
      data = addingNotifications(messageOwner, channelId, dmId, noteMessage, data);
    }
  }
  setData(data);
  return {};
}

/**
  * Given a message within a channel or DM the authorised user is part of, removes a "react" to that particular message.
  *
  * @param {token} token - authUser's unique token
  * @param {number} messageId - message's unique id
  * @param {number} reactId - react's id (1)
  * ...
  * @returns {object} - nothing
  * @returns {object} - error
*/
export function messageUnreactV1(token: string, messageId: number, reactId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();

  // checking for valid token
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'fail to change token to uId');
  }

  const userId = tokenToUId(token).authorisedId;

  // Validate reactId
  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is not a valid react ID');
  }

  // LOGIC: Search through Channels and DMS to find the message
  let foundMessage;
  let isAuthorized = false;

  // Search the channels
  for (const channel of data.channels) {
    if (channel.allMembers.some((user: User) => user.uId === userId)) {
      foundMessage = channel.messages.find((msg) => msg.messageId === messageId);
      if (foundMessage) {
        isAuthorized = true;
        break;
      }
    }
  }

  // Search the DMS
  if (!isAuthorized) {
    for (const dm of data.dms) {
      if (dm.memberId.includes(userId)) {
        foundMessage = dm.messages.find((msg) => msg.messageId === messageId);
        if (foundMessage) {
          isAuthorized = true;
          break;
        }
      }
    }
  }

  if (!foundMessage || !isAuthorized) {
    throw HTTPError(400, 'Invalid messageId or unauthorized user');
  }

  // AT THIS POINT REMOVE THE REACT
  // Find the react with the specified reactId
  const existingReact = foundMessage.reacts.find((react) => react.reactId === reactId);

  if (existingReact) {
    // Check if the user has reacted
    const userIndex = existingReact.uIds.indexOf(userId);

    if (userIndex === -1) {
      throw HTTPError(400, 'The message does not contain a react with ID reactId from the authorised user');
    }

    // Remove the user from the uId section of the existing react
    existingReact.uIds.splice(userIndex, 1);

    // If there are no more uIds in the react, remove the react itself
    if (existingReact.uIds.length === 0) {
      const reactIndex = foundMessage.reacts.indexOf(existingReact);
      foundMessage.reacts.splice(reactIndex, 1);
    }
  } else {
    throw HTTPError(400, 'The message does not contain a react with ID reactId from the authorised user');
  }

  setData(data);
  return {};
}

/**
  * Given a message within a channel or DM, marks it as "pinned".
  *
  * @param {token} token - authUser's unique token
  * @param {number} messageId - message's unique id
  * ...
  * @returns {object} - nothing
  * @returns {object} - error
*/
export function messagePinV1(token: string, messageId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = tokenToUId(token).authorisedId;
  // ERROR CASES
  if (!existingMessage(userId, messageId)) {
    throw HTTPError(400, 'invalid message within a channel or DM that the authorised user is part of');
  }
  if (existingMessage(userId, messageId) && !isDmOrChannelOwner(userId, messageId)) {
    throw HTTPError(403, 'valid message but no owner permission');
  }
  if (isPinned(messageId)) {
    throw HTTPError(400, 'message is already pinned');
  }
  // VALID CASE
  // if it is dm
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        message.isPinned = true;
        setData(data);
      }
    }
  }
  // if it is channel
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        message.isPinned = true;
        setData(data);
      }
    }
  }
  return {};
}

export function messageUnpinV1(token: string, messageId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = tokenToUId(token).authorisedId;
  // ERROR CASES
  if (!existingMessage(userId, messageId)) {
    throw HTTPError(400, 'invalid message within a channel or DM that the authorised user is part of');
  }
  if (existingMessage(userId, messageId) && !isDmOrChannelOwner(userId, messageId)) {
    throw HTTPError(403, 'valid message but no owner permission');
  }
  if (!isPinned(messageId)) {
    throw HTTPError(400, 'message is not already pinned');
  }
  // VALID CASE
  // if it is dm
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        message.isPinned = false;
        setData(data);
      }
    }
  }
  // if it is channel
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        message.isPinned = false;
        setData(data);
      }
    }
  }
  return {};
}

/**
  * ogMessageId is the ID of the original message. channelId is
  * the channel that the message is being shared to, and is -1 if it
  * is being sent to a DM. dmId is the DM that the message is
  * being shared to, and is -1 if it is being sent to a channel.
  * message is the optional message in addition to the shared
  * message, and will be an empty string '' if no message is given.
  *
  * A new message containing the contents of both the original
  * message and the optional message should be sent to the
  * channel/DM identified by the channelId/dmId. The format of
  * the new message does not matter as long as both the original
  * and optional message exist as a substring within the new
  * message. Once sent, this new message has no link to the original
  * message, so if the original message is edited/deleted, no change
  * will occur for the new message.
  *
  * @param {token} token - authUser's unique token
  * @param {number} ogMessageId - ID of original message
  * @param {string} message - message to be sent
  * @param {number} channelId - channel's unique id
  * @param {number} dmId - dm's unique id
  * ...
  * @returns {sharedMessageId: number} - new shared message's messageId
  * @returns {object} - error
*/
export function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = tokenToUId(token).authorisedId;
  // 400 ERROR
  if (!existingChannel(channelId) && !existingDM(dmId)) {
    throw HTTPError(400, 'both channelId and dmId are invalid');
  }
  if ((channelId !== -1) && (dmId !== -1)) {
    throw HTTPError(400, 'neither channelId nor dmId are -1');
  }
  // ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined
  if (!existingMessage(userId, ogMessageId)) {
    throw HTTPError(400, 'original message not found');
  }
  // length of optional message is more than 1000 characters
  if (message.length > 1000) {
    throw HTTPError(400, 'message is too long');
  }
  // 403 ERROR
  // the pair of channelId and dmId are valid (i.e. one is -1, the other is valid) (they are valid here)
  // and the authorised user has not joined the channel or DM they are trying to share the message to
  if (existingChannel(channelId)) {
    if (!isMember(userId, channelId)) {
      throw HTTPError(403, 'you have not joined the channel');
    }
  }
  if (existingDM(dmId)) {
    if (!isDmMember(userId, dmId)) {
      throw HTTPError(403, 'you have not joined the DM');
    }
  }

  // VALID CASE

  // create new message
  let originalMessage;
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === ogMessageId) {
        originalMessage = message.message;
      }
    }
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === ogMessageId) {
        originalMessage = message.message;
      }
    }
  }

  const separator = '-'.repeat(56);
  const newMessage = `-------------------(Original Message)-------------------\n${originalMessage}\n${separator}\n${message}`;
  // send to channel
  if (dmId === -1) {
    const sharedMessageId = (messageSendV1(token, channelId, newMessage) as messageReturnId).messageId;
    return { sharedMessageId };
  } else if (channelId === -1) {
    // send to dm
    const sharedMessageId = (messageSendDmV1(token, dmId, newMessage) as messageReturnId).messageId;
    return { sharedMessageId };
  }
}
