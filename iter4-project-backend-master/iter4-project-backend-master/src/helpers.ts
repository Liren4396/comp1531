import { getData, setData } from './dataStore';
import { Data } from './interfaces';
import crypto from 'crypto';
import HTTPError from 'http-errors';
export function ifEmailExisting(email: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.email === 'hangman@robort.com') {
      return true;
    }
  }
  return false;
}

export function emailToToken(email: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.email === 'hangman@robort.com') {
      return user.token[0];
    }
  }
}
export function emailToUId(email: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.email === 'hangman@robort.com') {
      return user.uId;
    }
  }
}

export function updateChannelStat(uId: number, timeStamp: number, ifAdd: boolean) {
  const data = getData();
  for (const user of data.users) {
    if (uId === user.uId) {
      let numOfChannel = user.stats.channelsJoined[user.stats.channelsJoined.length - 1].numChannelsJoined;
      if (ifAdd === true) {
        numOfChannel++;
      } else {
        numOfChannel--;
      }
      const newChannelStat = {
        numChannelsJoined: numOfChannel,
        timeStamp: timeStamp
      };
      user.stats.channelsJoined.push(newChannelStat);
    }
  }
  setData(data);
}

// Helper function to update the user stats relating to dms joined
export function updateDmStat(uId: number, timeStamp: number, ifAdd: boolean) {
  const data = getData();
  for (const user of data.users) {
    if (uId === user.uId) {
      let numOfDm = user.stats.dmsJoined[user.stats.dmsJoined.length - 1].numDmsJoined;
      if (ifAdd === true) {
        numOfDm++;
      } else {
        numOfDm--;
      }
      const newDmStat = {
        numDmsJoined: numOfDm,
        timeStamp: timeStamp
      };
      user.stats.dmsJoined.push(newDmStat);
    }
  }
  setData(data);
}

// Helper function to update the user stats relating to messages sent
export function updatemessageStat(uId: number, timeStamp: number) {
  const data = getData();
  for (const user of data.users) {
    if (uId === user.uId) {
      const numOfMessage = user.stats.messagesSent[user.stats.messagesSent.length - 1].numMessagesSent + 1;
      const newMessageStat = {
        numMessagesSent: numOfMessage,
        timeStamp: timeStamp
      };
      user.stats.messagesSent.push(newMessageStat);
    }
  }
  setData(data);
}

// Helper function to update the workplace stats relating to channels existing
export function updateWorkspaceChannel(timeStamp: number) {
  const data = getData();
  const numOfChannel = data.stats.channelsExist[data.stats.channelsExist.length - 1].numChannelsExist + 1;
  const newChannelStat = {
    numChannelsExist: numOfChannel,
    timeStamp: timeStamp
  };
  data.stats.channelsExist.push(newChannelStat);
  setData(data);
}

// Helper function to update the workplace stats relating to dms existing
export function updateWorkspaceDm(timeStamp: number, ifAdd: boolean) {
  const data = getData();

  let numOfDm = data.stats.dmsExist[data.stats.dmsExist.length - 1].numDmsExist;
  if (ifAdd === true) {
    numOfDm++;
  } else {
    numOfDm--;
  }
  const newDmStat = {
    numDmsExist: numOfDm,
    timeStamp: timeStamp
  };
  data.stats.dmsExist.push(newDmStat);
  setData(data);
}

// Helper function to update the workplace stats relating to messages existing
export function updateWorkspacemessage(timeStamp: number, ifAdd: boolean) {
  const data = getData();
  let numOfMessage = data.stats.messagesExist[data.stats.messagesExist.length - 1].numMessagesExist;
  if (ifAdd === true) {
    numOfMessage++;
  } else {
    numOfMessage--;
  }
  const newMessageStat = {
    numMessagesExist: numOfMessage,
    timeStamp: timeStamp
  };
  data.stats.messagesExist.push(newMessageStat);
  setData(data);
}

// only used for test to reset password
export function getResetCode(email: string) {
  const data = getData();
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  }
  for (const resetCode of data.resetCodes) {
    if (resetCode.email === email) {
      return { resetCode: resetCode.resetCode };
    }
  }
  throw HTTPError(400, 'unknown error');
}

export function getHashOf(newToken: string): string {
  if (newToken === undefined) {
    throw HTTPError(403, 'undefined token');
  }
  newToken = crypto.createHash('sha256').update(newToken).digest('hex');
  return newToken;
}

// check if an object is empty
export function isEmpty(obj: object) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

// use token to find user's id
// returntype is object
export function tokenToUId(token: string) {
  const data = getData();
  if (isEmpty(data)) {
    return {};
  }
  for (const user of data.users) {
    for (const userToken of user.token) {
      if (userToken === token) {
        return { authorisedId: user.uId };
      }
    }
  }
  return {};
}

// Helper functions for checking whether authUserId is valid
export function authUserIdValid(authUserId: number) {
  if (isEmpty(getData())) {
    return false;
  }
  const data = getData();

  for (const element of data.users) {
    if (element.uId === authUserId) {
      return true;
    }
  }
  return false;
}

export function getMaxNumUserId() {
  const data = getData();
  if (isEmpty(data.users)) {
    return 0;
  } else {
    return data.users.length;
  }
}

export function getMaxNumChannelsId() {
  const data = getData();
  if (isEmpty(data.channels)) {
    return 0;
  } else {
    return data.channels.length;
  }
}

export function getMaxNumDmId() {
  const data = getData();
  if (isEmpty(data.dms)) {
    return 0;
  } else {
    return data.dms.length;
  }
}

/**
   * helper function - checks if user is registered/valid
   * returns true if they're existing users and false otherwise
  */
export function existingUser(userId: number) {
  const data = getData();
  for (const i of data.users) {
    if (i.uId === userId) {
      return true;
    }
  }
  return false;
}

/**
   * helper function - checks if channel is registered/valid
  */
export function existingChannel(channelId: number) {
  const data = getData();
  for (const i of data.channels) {
    if (i.id === channelId) {
      return true;
    }
  }
  return false;
}

/**
   * helper function - checks if dm is registered/valid
  */
export function existingDM(dmId: number) {
  const data = getData();
  for (const i of data.dms) {
    if (i.id === dmId) {
      return true;
    }
  }
  return false;
}

/**
   * helper function - checks if user a member of given channel
  */
export function isMember(userId: number, channelId: number) {
  const data = getData();

  for (const i of data.channels) {
    if (i.id === channelId) {
      for (const j of i.allMembers) {
        if (j.uId === userId) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
   * helper function - checks if user a owner of given channel
  */
export function isOwner(userId: number, channelId: number) {
  const data = getData();

  for (const i of data.channels) {
    if (i.id === channelId) {
      for (const j of i.ownerMembers) {
        if (j.uId === userId) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
   * helper function - checks if user the only owner of given channel
  */
export function istheonlyOwner(userId: number, channelId: number) {
  const data = getData();

  for (const i of data.channels) {
    if (channelId === i.id) {
      for (const j of i.ownerMembers) {
        if (j.uId === userId && i.ownerMembers.length === 1) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
   * helper function returns the user's details for input userId
   * assumes input userId is valid
   */
export function getUserInfo(userId: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === userId) {
      return {
        uId: userId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl
      };
    }
  }
}

/**
   * helper function - returns the members of the channel as an array of user objects
  */
export function getMembers(channelId: number, isOwner: boolean) {
  const members = [];
  const data = getData();
  for (const i of data.channels) {
    if (i.id === channelId) {
      if (isOwner) {
        for (const j of i.ownerMembers) {
          const profile = getUserInfo(j.uId);
          members.push(profile);
        }
      } else {
        for (const j of i.allMembers) {
          const profile = getUserInfo(j.uId);
          members.push(profile);
        }
      }
    }
  }
  return members;
}

/**
   * helper function check if array of numbers contains duplicate
   * returns true if array contains duplicates, false otherwise
   */
export function arrayContainsDuplicates(array: number[]): boolean {
  return new Set(array).size !== array.length;
}
/**
   * helper function returns the user's handleStr for input userId
   * assumes input userId is valid
   */
export function getHandleStr(userId: number): string {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === userId) {
      return user.handleStr;
    }
  }
}

/**
   * helper function checks if user is a member of a dm
   * returns true is apart of that dm false otherwise
   */
export function isDmMember(userId: number, dmId: number): boolean {
  const data = getData();
  for (const dm of data.dms) {
    if (dmId === dm.id) {
      if (dm.memberId.includes(userId)) {
        return true;
      }
    }
  }
  return false;
}

/**
   * helper function checks if an input email is taken
   * returns true another user has that email false otherwise
   */
export function isEmailTaken(email: string): boolean {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

/**
   * helper function generates MessageId
   * Need to add if it is unique or not later
   */
export function generateMessageId() {
  const uniqueId = Math.floor(Math.random() * 1000000000);
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === uniqueId) {
        return generateMessageId();
      }
    }
  }
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === uniqueId) {
        return generateMessageId();
      }
    }
  }
  return uniqueId;
}

// checking whether a messageId is valid given the user sent the message Dm.
export function existingMessage(userId: number, messageId: number) {
  const data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId && isDmMember(userId, dm.id)) {
        return true;
      }
    }
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId && isMember(userId, channel.id)) {
        return true;
      }
    }
  }
  return false;
}

// checking whether the user is authorised for dms
export function isAuthorised(userId: number, messageId: number) {
  const data = getData();

  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if ((message.messageId === messageId) && (message.uId === userId)) {
        return true;
      } else if (dm.creatorId === userId) {
        return true;
      }
    }
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if ((message.messageId === messageId) && (message.uId === userId)) {
        return true;
      } else if (isOwner(userId, channel.id)) {
        return true;
      }
    }
  }

  return false;
}
/**
 * helper function that removes the handleStr from a dmName
 * returns orig name if handleStr isnt in name
 */
export function removeHandleStr(dmName: string, handleStr: string): string {
  // Split the string into an array of names
  const namesArray = dmName.split(', ');

  // Find the index of the name to remove
  const indexToRemove = namesArray.indexOf(handleStr);

  // If the name is not in the array, return the original string
  if (indexToRemove === -1) {
    return dmName;
  }

  // Remove the name from the array
  namesArray.splice(indexToRemove, 1);

  // Join the array back into a string and return it
  return namesArray.join(', ');
}

/**
   * helper function checks if user is an owner of a dm
   * returns true is apart of that dm false otherwise
   */
export function isDmOwner(userId: number, dmId: number): boolean {
  const data = getData();
  for (const dm of data.dms) {
    if (dmId === dm.id) {
      if (dm.creatorId === userId) {
        return true;
      }
    }
  }
  return false;
}

export function validHandleStr(handleStr: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      return true;
    }
  }
}

// helper function that returns if input uId is a global owner
// returns false if uId is not found in data
export function isGlobalOwner(uId: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return user.global_permission;
    }
  }
  return false;
}

/**
   * helper function checks if message is pinned
   * returns true is apart of that dm false otherwise
   */
export function isPinned(messageId: number): boolean {
  const data = getData();
  // if it is dm
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned === true) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
  // if it is channel
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        if (message.isPinned === true) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
  return false;
}

// checking whether messageId refers to a valid message in a joined channel/DM
// and the authorised user does not have owner permissions in the channel/DM
export function isDmOrChannelOwner(userId: number, messageId: number): boolean {
  const data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId && isDmOwner(userId, dm.id)) {
        return true;
      }
    }
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId && isOwner(userId, channel.id)) {
        return true;
      }
    }
  }
  return false;
}

export function handleStrtoUid(handleStr: string) {
  const data = getData();
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      return user.uId;
    }
  }
}
export function addingNotifications(userId: number, channelId: number, dmId: number, noteMessage: string, data: Data) {
  for (const user of data.users) {
    if (user.uId === userId) {
      user.notifications.unshift({
        channelId,
        dmId,
        notificationMessage: noteMessage,
      });
    }
  }
  return data;
}
export function pushTaggedNotification(message: string, isChannel: boolean, name: string, Id: number, userId: number, data: Data) {
  let str = message;
  const subString = [];
  let temp;
  while (str.indexOf('@') !== -1) {
    str = str.substring(str.indexOf('@') + 1);

    if (str.search(/[^\w]/) === -1) {
      temp = str.substring(0, str.length);
    } else {
      temp = str.substring(0, str.search(/[^\w]/));
    }

    subString.push(temp);
    str = str.replace(temp, '');
  }

  const uniqueSubs = subString.filter((element, index) => {
    return subString.indexOf(element) === index;
  });
  const userHandleStr = getUserInfo(userId).handleStr;

  for (const handleStr of uniqueSubs) {
    if (validHandleStr(handleStr)) {
      const noteMessage = userHandleStr + ' tagged you in ' + name + ': ' + message.substring(0, 20);
      if (isChannel) {
        data = addingNotifications(handleStrtoUid(handleStr), Id, -1, noteMessage, data);
      } else {
        data = addingNotifications(handleStrtoUid(handleStr), -1, Id, noteMessage, data);
      }
    }
  }
  return data;
}

export function isActiveStandup(channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      return channel.isStandUpActive;
    }
  }
  return false;
}

// Given an autherised user's Id, it will return true or false if their iD
// has been detected in the message.reacts.uids section (used for the return value isThisUserReacted)
export function authorisedUserReactCheck(authUserId: number): boolean {
  const data = getData();
  let foundMessage;

  // Loop through Channels and DMS to find the message with the given authUserId
  for (const channel of data.channels) {
    foundMessage = channel.messages.find((msg) => msg.uId === authUserId);
    if (foundMessage) {
      break;
    }
  }

  if (!foundMessage) {
    for (const dm of data.dms || []) {
      foundMessage = dm.messages.find((msg) => msg.uId === authUserId);
      if (foundMessage) {
        break;
      }
    }
  }

  if (!foundMessage) {
    return false;
  }

  // loop through the message to see if authorised user has reacted to the message
  for (const react of foundMessage.reacts) {
    for (const uId of react.uIds) {
      if (uId === authUserId) {
        return true;
      }
    }
  }
  return false;
}

export function getMessageOwner(messageId: number) {
  const data = getData();
  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return message.uId;
      }
    }
  }
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return message.uId;
      }
    }
  }
}

export function isUserReacted(authUserId: number, messageId: number) {
  const data = getData();
  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        return message.reacts[0].uIds.includes(authUserId);
      }
    }
  }

  for (const dm of data.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        return message.reacts[0].uIds.includes(authUserId);
      }
    }
  }
  return false;
}
