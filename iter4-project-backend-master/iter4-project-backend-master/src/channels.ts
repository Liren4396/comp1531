import { getData, setData } from './dataStore';
import { tokenToUId, getMaxNumChannelsId, isEmpty, updateWorkspaceChannel, updateChannelStat } from './helpers';
import { channelregistertype, error } from './interfaces';
import HTTPError from 'http-errors';

/**
  * Creates a new channel with the given name, that is either a public or
  * private channel. The user who created it automatically joins the channel.
  *
  * @param {string} token - authUser's unique id
  * @param {string} name - user's name who creates the channel
  * @param {boolean} isPulic - private or public channel
  * ...
  *
  * @returns {channelId} - valid name and authUderId
  * @returns {error: 'error'} - length of name is less than 1 or more than 20
  *                           - authUserId is invalid
  *
  *
*/
export function channelsCreateV1 (token: string, name: string, isPublic: boolean): channelregistertype | error {
  // name needs to be 1 - 20 lengths
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'name length less than 1 or greater than 20');
  }
  // check authUserId is valid or not
  if (JSON.stringify(tokenToUId(token)) === '{}') {
    throw HTTPError(403, 'invalid token');
  }

  const authUserId = tokenToUId(token).authorisedId;

  // create new channel id
  const data = getData();
  const newId = getMaxNumChannelsId() + 1;

  let u;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      u = user;
    }
  }
  // store data
  data.channels.push({
    id: newId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [u],
    allMembers: [u],
    start: 0,
    end: 0,
    messages: [],
    isStandUpActive: false,
    buffer: [],
    timeFinish: 0,
    gameStart: 0
  });
  setData(data);
  updateChannelStat(authUserId, Math.floor(Date.now() / 1000), true);
  updateWorkspaceChannel(Date.now() / 1000);
  return { channelId: newId };
}

/**
  * <Function takes token as input and outputs an array of channels the userID is registered in>
  *
  * @param {string} token - ID of the user
  * ...
  *
  * @returns {Array} - Array of channels
  * @returns {Object} - error
*/

export function channelsListV1 (token: string) {
  // checking whether the data passed in is empty or not
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();

  // checking whether the token has been registered/ valid
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = tokenToUId(token).authorisedId;

  const returnedArray = [];
  // Looping through the data structure to locate which channel contains user
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === authUserId) {
        returnedArray.push({
          channelId: channel.id,
          name: channel.name
        });
      }
    }
  }
  return {
    channels: returnedArray
  };
}

/**
  * <Function takes authUserId as input and outputs an array of all the channels>
  *
  * @param {string} token - ID of the user
  * ...
  *
  * @returns {Array} - Array of channels
  * @returns {Object} - error
*/

export function channelsListAllV1 (token: string) {
  // checking whether the data passed in is empty or not
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();

  // checking whether the token has been registered/ valid
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }

  const returnedArray = [];
  for (const channel of data.channels) {
    returnedArray.push({
      channelId: channel.id,
      name: channel.name
    });
  }

  return {
    channels: returnedArray
  };
}
