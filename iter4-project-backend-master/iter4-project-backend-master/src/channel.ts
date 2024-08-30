import { getData, setData } from './dataStore';
import {
  isEmpty,
  tokenToUId,
  existingChannel,
  existingUser,
  isMember,
  isOwner,
  getMembers,
  istheonlyOwner,
  getHandleStr,
  addingNotifications,
  isUserReacted,
  updateChannelStat
} from './helpers';
import HTTPError from 'http-errors';

/**
 * function that returns object containing details about given channelId
 * @param {number} authUserId
 * @param {number} channelId
 * @return {Object} {name, isPublic, ownerMembers, allMembers}
*/
function channelDetailsV1(token: string, channelId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = tokenToUId(token).authorisedId;
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  } else if (!isMember(authUserId, channelId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  for (const chan of data.channels) {
    if (chan.id === channelId) {
      return {
        name: chan.name,
        isPublic: chan.isPublic,
        ownerMembers: getMembers(channelId, true),
        allMembers: getMembers(channelId, false)
      };
    }
  }
}

/**
 * function that invites a valid member into channel
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} uId
 * @returns nothing
 */
function channelInviteV1(token: string, channelId: number, uId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  let data = getData();
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = tokenToUId(token).authorisedId;
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  } else if (!existingUser(uId)) {
    throw HTTPError(400, 'invalid uId');
  } else if (isMember(uId, channelId)) {
    throw HTTPError(400, 'user is already a member of the channel');
  } else if (!isMember(authUserId, channelId)) {
    throw HTTPError(403, 'you are not a member of this channel');
  }

  let u;
  for (const user of data.users) {
    if (user.uId === uId) {
      user.channelId.push(channelId);
      u = user;
    }
  }

  for (const channel of data.channels) {
    if (channel.id === channelId) {
      channel.allMembers.push(u);
      // notification
      const ownerHandle = getHandleStr(authUserId);
      const noteMessage = ownerHandle + ' added you to ' + channel.name;
      data = addingNotifications(uId, channelId, -1, noteMessage, data);
    }
  }

  setData(data);
  updateChannelStat(authUserId, Math.floor(Date.now() / 1000), true);
  return {};
}

/**
 * Make user with user id uId an owner of the channel.
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns nothing
 */
function channeladdownerV1(token: string, channelId: number, uId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // channelId does not refer to a valid channel
  // uId does not refer to a valid user
  if (!existingChannel(channelId) ||
    !existingUser(uId)) {
    throw HTTPError(400, 'invalid channelId or invalid uId');
    // uId refers to a user who is not a member of the channel
    // uId refers to a user who is already an owner of the channel
  } else if (!isMember(uId, channelId)) {
    throw HTTPError(400, 'user is not a member of the channel');
  } else if (isOwner(uId, channelId)) {
    throw HTTPError(400, 'user is the owner of the channel');
  }

  const auth = tokenToUId(token);
  // token is invalid
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }

  let u;
  // channelId is valid and the authorised user
  // does not have owner permissions in the channel
  for (const user of data.users) {
    if (user.uId === auth.authorisedId) {
      if (user.global_permission === false && !isOwner(auth.authorisedId, channelId)) {
        throw HTTPError(403, 'user does not have permissions in the channel');
      }
    }
  }
  for (const user of data.users) {
    if (user.uId === uId) {
      u = user;
      break;
    }
  }

  for (const channel of data.channels) {
    if (channel.id === channelId) {
      channel.ownerMembers.push(u);
    }
  }
  setData(data);
  return {};
}

/**
 * Remove user with user id uId as an owner of the channel.
 * @param {string} token - authUser's unique token
 * @param {number} channelId - channel's unique id
 * @param {number} uId - user's id
 * ...
 *
 * @returns {object} - nothing
 * @returns {object} - error
 */
// Naming should be channelRemoveownerV1
function channelremoveownerV1(token: string, channelId: number, uId: number) {
  const data = getData();
  const auth = tokenToUId(token);
  // ERROR CASE: channelId does not refer to a valid channel
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  } else {
    // ERROR CASE: channelId is valid
    // and the authorised user does not have owner permissions in the channel
    for (const user of data.users) {
      if (user.uId === auth.authorisedId) {
        if (user.global_permission === false && !isOwner(auth.authorisedId, channelId)) {
          throw HTTPError(400, 'user does not have owner permissions in the channel');
        }
      }
    }
  }
  // ERROR CASE: uId does not refer to a valid user
  if (!existingUser(uId)) {
    throw HTTPError(400, 'invalid user');
  }
  // ERROR CASE: uId refers to a user who is not an owner of the channel
  // ERROR CASE: uId refers to a user who is currently the only owner of the channel
  if (!isOwner(uId, channelId)) {
    throw HTTPError(400, 'user is not an owner of the channel');
  }
  if (istheonlyOwner(uId, channelId)) {
    throw HTTPError(400, 'user is the only onwer of the channel');
  }
  // ERROR CASE: token is invalid
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }

  // remove owner
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      let i = 0;
      for (const owner of channel.ownerMembers) {
        if (owner.uId === uId) {
          channel.ownerMembers.splice(i, 1);
          setData(data);
          return {};
        }
        i++;
      }
    }
  }
}

/**
  * Given a channel with ID channelId that the authorised user is a member of,
  * returns up to 50 messages between index "start" and "start + 50".
  * If messages' number < 50, then return all the messages.
  *
  * @param {token} token - authUser's unique token
  * @param {number} channelId - channel's unique id
  * @param {number} start - index that represents the first message
  * ...
  *
  * @returns {Array<{messageId: number, uId: number, message: string, timeSent: number}>}
  * - array include objects:
  * - message's unique id, who send the messagfe, message's content, time user sent the massage
  *
  * @returns {number} - index that represents the first message
  * @returns {number} - index that represents the last message
*/

function channelMessagesV1(token: string, channelId: number, start: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();

  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = tokenToUId(token).authorisedId;
  let flag = 0;
  // channelId is valid and the authorised user is not a member of the channel
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === authUserId) {
        flag = 1;
      }
    }
  }
  if (flag === 0) {
    throw HTTPError(400, 'user is not a member of the channel');
  }
  // find channel by using channelId
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      // start is greater than the total number of messages in the channel
      if (start > channel.messages.length) {
        throw HTTPError(400, 'start is greater than the total number of messages in the channel');
      } else {
        // no error
        const returnMessage = [];
        let final = start + 50;
        let returnEnd = final;
        if (final > channel.messages.length) {
          final = channel.messages.length;
          returnEnd = -1;
        }

        for (let begin = final - 1; begin >= start; --begin) {
          const modifiedMessage = { ...channel.messages[begin] };

          // Add a new value to each object in the reacts array
          modifiedMessage.reacts = modifiedMessage.reacts.map(react => {
            return { ...react, isThisUserReacted: isUserReacted(authUserId, modifiedMessage.messageId) };
          });

          returnMessage.push(modifiedMessage);
        }

        return {
          messages: returnMessage,
          start: start,
          end: returnEnd
        };
      }
    }
  }
}

/**
  * Given a channelId of a channel that the authorised user can join, adds them to that channel.
  *
  * @param {string} token - authUser's unique id
  * @param {number} channelId - channel's unique id
  * ...
  *
  * @returns {} - nothing
*/
function channelJoinV1(token: string, channelId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = tokenToUId(token).authorisedId;

  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  } else if (isMember(authUserId, channelId)) {
    throw HTTPError(400, 'user is already a member of the channel');
  }
  const channelExist = data.channels[channelId - 1];
  const userExist = data.users[authUserId - 1];

  // Channel is private check if the global owner can join or not
  if (channelExist.isPublic === false) {
    // if the user not HAS global permissions
    if (userExist.global_permission !== true) {
      throw HTTPError(403, 'Channel is private and user doesnt have global permission');
    }
  }

  channelExist.allMembers.push(userExist);
  userExist.channelId.push(channelId);
  setData(data);
  updateChannelStat(authUserId, Math.floor(Date.now() / 1000), true);
  return {};
}

export function channelLeaveV1(token: string, channelId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();
  // checking if channelId refer to a valid channel
  if (!existingChannel(channelId)) {
    throw HTTPError(400, 'invalid channelId');
  }
  // checking whether the token is valid
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = tokenToUId(token).authorisedId;
  // checking if user is a memeber of the channel
  if (!isMember(userId, channelId)) {
    throw HTTPError(400, 'user is not a member of the channel');
  }

  // removing user from allMembers
  for (const channel of data.channels) {
    if (channel.id === channelId) {
      for (const member of channel.allMembers) {
        if (member.uId === userId) {
          const index = channel.allMembers.indexOf(member);
          channel.allMembers.splice(index, 1);
          break;
        }
      }
      for (const owner of channel.ownerMembers) {
        if (owner.uId === userId) {
          const index = channel.ownerMembers.indexOf(owner);
          channel.ownerMembers.splice(index, 1);
          break;
        }
      }
    }
  }
  setData(data);
  updateChannelStat(userId, Math.floor(Date.now() / 1000), false);
  return {};
}

export { channelDetailsV1, channelInviteV1, channeladdownerV1, channelJoinV1, channelMessagesV1, channelremoveownerV1 };
