import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { User } from './interfaces';
import {
  isGlobalOwner,
  isEmpty,
  tokenToUId,
  existingUser,
} from './helpers';

/// ////////////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////        Function For admin/userpermission/change/v1         /////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * function that allows owner to change users permissions
 * @param token user session token
 * @param uId uId whose permission is being changed
 * @param permissionId 1 for owner 2 for member
 * @returns error or {} upon sucess
 */
export function adminUserpermissionChangeV1(token: string, uId: number, permissionId: number) {
  // Global permissions
  // Owners (permission ID 1), who can also modify other owners' permissions
  // Members (permission ID 2), who do not have any special permissions

  // ERRORS
  // 400 Error when any of:
  //    - uId does not refer to a valid user (DONE)
  //    - uId refers to a user who is the only global owner and they are being demoted to a user (DONE)
  //    - permissionId is invalid (DONE)
  //    - the user already has the permissions level of permissionId (DONE)
  //
  // 403 Error when:
  //    - the authorised user is not a global owner

  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();
  // checking for valid token
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'fail to change uId to token');
  }

  // Check for invalid permissionId
  if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'permissionId is not a valid permission ID');
  }

  // CHECKS IF TOKEN HAS PERMISSIONS TO CHANGE
  const authorisedCheck = tokenToUId(token).authorisedId;
  const authUser = data.users.find((user) => user.uId === authorisedCheck);
  if (authUser.global_permission === false) {
    throw HTTPError(403, 'The authorized user is not a global owner');
  }

  // Get the user that needs to be updated
  const findUser = data.users?.find((user) => user.uId === uId);
  if (!findUser) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }

  // Check if user already has the permissions level of permissionId
  if (findUser.global_permission === true && permissionId === 1) {
    throw HTTPError(400, 'The user already has the permissions level of permissionId (global)');
  } else if (findUser.global_permission === false && permissionId === 2) {
    throw HTTPError(400, 'The user already has the permissions level of permissionId (not global)');
  }

  // Check if user is the only global owner and they are being demoted to a user
  const globalOwners = data.users?.filter((user) => user.global_permission);
  if (globalOwners?.length === 1 && globalOwners[0].uId === uId) {
    throw HTTPError(400, 'The user is the only global owner and they are being demoted to a user');
  }

  if (permissionId === 1) {
    findUser.global_permission = true;
  } else if (permissionId === 2) {
    findUser.global_permission = false;
  }

  setData(data);
  return {};
}

/**
 * function that removes users from unsw meme
 * @param token user session token
 * @param uId for member who is being removed
 * @returns error or {} upon completion
 */
export function adminUserRemoveV1(token: string, uId: number) {
  const data = getData();
  const auth = tokenToUId(token);
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  } else if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  } else if (!existingUser(uId)) {
    throw HTTPError(400, 'invalid userId');
  }
  const authUserId = tokenToUId(token).authorisedId;
  if (!isGlobalOwner(authUserId)) {
    throw HTTPError(403, 'no permission');
  }
  const globalOwners = data.users?.filter((user) => user.global_permission);
  if (globalOwners?.length === 1 && globalOwners[0].uId === uId) {
    throw HTTPError(400, 'cannot remove the only global owner');
  }
  let stat;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      stat = user.stats;
    }
  }
  // update user info
  const removedUser: User = {
    nameFirst: 'Removed',
    nameLast: 'user',
    email: 'removeduser@email.com',
    handleStr: 'removeduser',
    password: 'removeduser',
    global_permission: false,
    channelId: [],
    token: [],
    uId: uId,
    notifications: [],
    profileImgUrl: '',
    stats: stat,
  };

  // remove from channel
  for (const channel of data.channels) {
    for (const i in channel.ownerMembers) {
      if (channel.ownerMembers[i].uId === uId) {
        channel.ownerMembers.splice(parseInt(i), 1);
      }
    }
    for (const i in channel.allMembers) {
      if (channel.allMembers[i].uId === uId) {
        channel.allMembers.splice(parseInt(i), 1);
      }
    }
    for (const message of channel.messages) {
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }
  // remove from dms
  for (const dm of data.dms) {
    const index = dm.memberId.indexOf(uId);
    if (index !== -1) {
      dm.memberId.splice(index, 1);
      for (const i in dm.members) {
        if (dm.members[i].uId === uId) {
          dm.members.splice(parseInt(i), 1);
        }
      }
      for (const message of dm.messages) {
        if (message.uId === uId) {
          message.message = 'Removed user';
        }
      }
    }
  }

  for (const i in data.users) {
    if (data.users[i].uId === uId) {
      data.users[i] = removedUser;
    }
  }
  setData(data);
  // user is removed - email and handlestr can be reused, but they still remain

  return {};
}
