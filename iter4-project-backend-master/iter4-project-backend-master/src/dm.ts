import { getData, setData } from './dataStore';
import {
  isEmpty,
  existingDM,
  tokenToUId,
  existingUser,
  arrayContainsDuplicates,
  getMaxNumDmId,
  getHandleStr,
  getUserInfo,
  isDmMember,
  addingNotifications,
  isUserReacted,
  updateDmStat,
  updateWorkspaceDm,
  updateWorkspacemessage
} from './helpers';
import { DmDetails, error, User, DM, dmInfo, dmReturnId, dmList } from './interfaces';
import HTTPError from 'http-errors';

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////        Function For /dm/remove/v1         ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////

// Remove an existing DM, so all members are no longer in the DM.
// This can only be done by the original creator of the DM.
/**
 * Remove an existing DM.
 * @param {string} token
 * @param {number} dmId
 * @returns nothing
 */
export function dmRemoveV1(token: string, dmId: number) {
  const data = getData();
  if (isEmpty(data) || isEmpty(data.dms)) {
    throw HTTPError(400, 'empty data');
  }
  // dmId does not refer to a valid DM
  if (!existingDM(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }

  const auth = tokenToUId(token);
  // token is invalid
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  for (const dm of data.dms) {
    if (dm.id === dmId) {
      // dmId is valid and the authorised
      // user is not the original DM creator
      if (auth.authorisedId !== dm.creatorId) {
        throw HTTPError(400, 'user is not the original DM creator');
      }
    }
  }
  // start remove dm
  for (let i = 0; i < data.dms.length; ++i) {
    if (data.dms[i].id === dmId) {
      data.dms.splice(i, 1);
      setData(data);
    }
  }

  updateDmStat(auth.authorisedId, Math.floor(Date.now() / 1000), false);
  for (const dm of data.dms) {
    if (dm.id === dmId) {
      for (const user of dm.members) {
        updateDmStat(user.uId, Math.floor(Date.now() / 1000), false);
      }
      for (const message of dm.messages) {
        if (message.messageId === 1) {
          console.log('haha');
        }
        updateWorkspacemessage(Math.floor(Date.now() / 1000), false);
      }
    }
  }
  updateWorkspaceDm(Math.floor(Date.now() / 1000), false);
  return {};
}

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////        Function For /dm/details/v1        ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Remove an existing DM.
 * @param {string} token
 * @param {number} dmId
 * @returns {name:string, uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string } object
 */
export function dmDetailsV1(token: string, dmId: number): DmDetails | error {
  const data = getData();
  if (isEmpty(data) || isEmpty(data.dms)) {
    throw HTTPError(400, 'empty data');
  }

  // First check if token user exists and the DM exists
  const user = data.users.find((user: User) => user.token.includes(token));
  const dm = data.dms.find((dm: DM) => dm.id === dmId);

  if (!dm) {
    throw HTTPError(400, 'the DM doesnt exists');
  } else if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  // Check if the authorized user's ID is a member of the DM
  if (!dm.memberId.includes(user.uId)) {
    throw HTTPError(400, 'user is not a member of the channel');
  }

  // Return the name of the DM:
  // name should be automatically generated based on the users that are in this DM.
  // The name should be an alphabetically-sorted, comma-and-space-separated list of user handles
  // const dmName = dm.members.map((member: userInfo) => member.handleStr).sort();

  return {
    name: dm.name,
    members: dm.members,
  };
}

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////        Function For /dm/create/v1         ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * function that creates a new dm
 * @param token token of any user session - user automatically become owner
 * @param uIds array of uids of users that will be added to dm
 * @returns dmId or error message upon failure
 */
export function dmCreateV1(token: string, uIds: number[]): dmReturnId | error {
  // checks for error conditions
  let data = getData();

  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  } else if (arrayContainsDuplicates(uIds)) {
    throw HTTPError(400, 'error');
  }
  for (const uId of uIds) {
    if (!existingUser(uId)) {
      throw HTTPError(400, 'invalid uId');
    }
  }
  const auth = tokenToUId(token);
  // token is invalid
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = auth.authorisedId;
  const userIds = [...uIds];
  if (!uIds.includes(authUserId)) {
    uIds.push(authUserId);
  }

  const name = [];
  const memberInfo = [];
  for (const user of uIds) {
    name.push(getHandleStr(user));
    memberInfo.push(getUserInfo(user));
  }

  const ownerHandle = getHandleStr(auth.authorisedId);
  const sortedName = name.sort();
  const Name = sortedName.join(', ');

  const newDm: DM = {
    id: getMaxNumDmId() + 1,
    creatorId: authUserId,
    name: Name,
    memberId: uIds,
    members: memberInfo,
    start: 0,
    end: 0,
    messages: [],
  };

  for (const Id of userIds) {
    const noteMessage = ownerHandle + ' added you to ' + Name;
    data = addingNotifications(Id, -1, newDm.id, noteMessage, data);
  }

  data.dms.push(newDm);
  setData(data);
  for (const uId of uIds) {
    updateDmStat(uId, Math.floor(Date.now() / 1000), true);
  }
  updateWorkspaceDm(Math.floor(Date.now() / 1000), true);
  return { dmId: newDm.id };
}

/// ////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Function For /dm/messages/v1        ///////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Remove an existing DM.
 * @param {string} token
 * @param {number} dmId
 * @param {number} start
 * @returns{messages: string, start: number, end: number} object
 */
export function dmMessagesV1(token: string, dmId: number, start: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  // checking for valid token.
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserId = tokenToUId(token).authorisedId;

  const data = getData();

  // First check if token user exists and the DM exists
  const user = data.users.find((user: User) => user.token.includes(token));
  const dm = data.dms.find((dm: DM) => dm.id === dmId);

  if (!dm) {
    throw HTTPError(400, 'the DM doesnt exists');
  }

  // Check if the authorized user's ID is a member of the DM
  if (!dm.memberId.includes(user.uId)) {
    throw HTTPError(400, 'user is not a member of DM');
  }

  // find the DM by using DmID
  for (const dms of data.dms) {
    if (dms.id === dmId) {
      // start is greater than the total number of messages in the channel
      if (start > dms.messages.length) {
        throw HTTPError(400, 'start is greater than the total number of messages in the channel');
      } else {
        // no error
        const returnMessage = [];
        let final = start + 50;
        let returnEnd = final;
        if (final > dms.messages.length) {
          final = dms.messages.length;
          returnEnd = -1;
        }

        // console.log(dms.messages[0])
        // console.log(dms.messages[0].reacts)

        for (let begin = final - 1; begin >= start; --begin) {
          const modifiedMessage = { ...dms.messages[begin] };

          // Add a new value to each object in the reacts array
          modifiedMessage.reacts = modifiedMessage.reacts.map(react => {
            return { ...react, isThisUserReacted: isUserReacted(authUserId, modifiedMessage.messageId) };
          });

          returnMessage.push(modifiedMessage);
        }

        // console.log(returnMessage[0])
        return {
          messages: returnMessage,
          start: start,
          end: returnEnd
        };
      }
    }
  }
}

/// ////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////        Function For /dm/list/v1        ///////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * function that takes in token of user and returns list of dms they are apart of
 * @param token token of any user sessions
 * @returns returns a list of dms and associate info that the user is apart of or error message
 */
export function dmListV1(token: string): dmList | error {
  const data = getData();
  const auth = tokenToUId(token);
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  } else if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  const authUserId = auth.authorisedId;
  const list = [];
  for (const dm of data.dms) {
    if (isDmMember(authUserId, dm.id)) {
      const dmId = dm.id;
      const name = dm.name;
      const obj: dmInfo = { dmId, name };
      list.push(obj);
    }
  }
  return { dms: list };
}

/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////        Function For /dm/leave/v1        ////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////
export function dmLeaveV1(token: string, dmId: number) {
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }
  const data = getData();

  // checking whether dmId is valid
  if (!existingDM(dmId)) {
    throw HTTPError(400, 'invalid dmId');
  }
  // checking whether token is valid
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }
  const userId = tokenToUId(token).authorisedId;
  // checking whether userId is a member of the dm
  if (!isDmMember(userId, dmId)) {
    throw HTTPError(400, 'userId is not a member of the dm');
  }
  // leaving dm does not change the name of the dm
  for (const dm of data.dms) {
    const index = dm.memberId.indexOf(userId);
    if (index !== -1) {
      dm.memberId.splice(index, 1);
      // dm.name = removeHandleStr(dm.name, handleStr);
      dm.members.splice(index, 1);
    }
  }
  setData(data);
  updateDmStat(userId, Math.floor(Date.now() / 1000), false);
  return {};
}
