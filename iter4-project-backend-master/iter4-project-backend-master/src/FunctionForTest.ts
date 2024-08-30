import { port, url } from './config.json';
import request from 'sync-request';

const SERVER_URL = `${url}:${port}`;

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           authUser             /////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v3',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        email, password,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v3',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );

  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestAuthLogout(token: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/logout/v2',
    {
      headers: {
        token: token,
      }

    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestAuthPasswordresetReset(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/reset/v1',
    {
      json: {
        resetCode: resetCode,
        newPassword: newPassword,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestAuthPasswordresetRequest(email: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/passwordreset/request/v1',
    {
      json: {
        email,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////           Channels             ////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    SERVER_URL + '/channels/create/v3',
    {
      json: {
        name: name,
        isPublic: isPublic,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelsList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/list/v3',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelsListAll(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/channels/listall/v3',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Channel             //////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/messages/v3',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        channelId: channelId,
        start: start,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/join/v3',
    {
      json: {
        channelId: channelId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/invite/v3',
    {
      json: {
        channelId: channelId,
        uId: uId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/channel/details/v3',
    {
      qs: {
        channelId: channelId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelAddowner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/addowner/v2',
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelRemoveowner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/removeowner/v2',
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestChannelLeave(token: string, channelId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/channel/leave/v2',
    {
      json: {
        channelId: channelId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////          Message             ///////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

export function requestMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/send/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/message/edit/v2',
    {
      json: {
        messageId,
        message,
      },
      headers: {
        token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/message/remove/v2',
    {
      qs: {
        messageId: messageId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageSendDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/message/senddm/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        dmId: dmId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

// iter3
// Search?
// message/share/v1
// message/react/v1 - DONE
// message/unreact/v1 - DONE
// message/pin/v1 - DONE
// message/unpin/v1 - DONE
// message/sendlater/v1
// message/sendlaterdm/v1
export function requestSearch(token: string, queryStr: string) {
  const res = request(
    'GET',
    SERVER_URL + '/search/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        queryStr: queryStr,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

// message/share/v1
// Question: Does it need th headers token to be inputted?
export function requestMessageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/share/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        ogMessageId: ogMessageId,
        message: message,
        channelId: channelId,
        dmId: dmId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageReact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/react/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        messageId: messageId,
        reactId: reactId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageUnreact(token: string, messageId: number, reactId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unreact/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        messageId: messageId,
        reactId: reactId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlater/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        channelId: channelId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessagePin(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/pin/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        messageId: messageId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestMessageUnpin(token: string, messageId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/unpin/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        messageId: messageId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestSendLaterDM(token: string, dmId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    SERVER_URL + '/message/sendlaterdm/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        dmId: dmId,
        message: message,
        timeSent: timeSent,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           DM             ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestDmDetails(token: string, dmId: number[]) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/details/v2',
    {
      qs: {
        dmId: dmId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/create/v2',
    {
      json: {
        uIds: uIds,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/dm/remove/v2',
    {
      qs: {
        dmId: dmId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/messages/v2',
    {
      qs: {
        dmId: dmId,
        start: start,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestDmList(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/dm/list/v2',
    {
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/dm/leave/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        dmId: dmId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Clear            /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestClear() {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           User           ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestGetNotification(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/notifications/get/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestUserProfileSetname(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setname/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        nameFirst: nameFirst,
        nameLast: nameLast
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestSetHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/sethandle/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        handleStr: handleStr
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/user/profile/v3',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        uId: uId
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestUsersAll(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/users/all/v2',
    {
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestUserProfileSetemail(token: string, email: string) {
  const res = request(
    'PUT',
    SERVER_URL + '/user/profile/setemail/v2',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        email: email
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const res = request(
    'POST',
    SERVER_URL + '/user/profile/uploadphoto/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        imgUrl: imgUrl,
        xStart: xStart,
        yStart: yStart,
        xEnd: xEnd,
        yEnd: yEnd,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           admin            /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestAdminUserpermissionChange(token: string, uId: number, permissionId: number) {
  const res = request(
    'POST',
    SERVER_URL + '/admin/userpermission/change/v1',
    {
      json: {
        uId: uId,
        permissionId: permissionId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestAdminUserRemove(token: string, uId: number) {
  const res = request(
    'DELETE',
    SERVER_URL + '/admin/user/remove/v1',
    {
      qs: {
        uId: uId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           standup        ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestStandupStart(token: string, channelId: number, length: number) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/start/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        channelId: channelId,
        length: length,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestStandupActive(token: string, channelId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/standup/active/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        channelId: channelId,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestStandupSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    SERVER_URL + '/standup/send/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        channelId: channelId,
        message: message,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           stat           ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestGetUserStat(token: string) {
  const res = request(
    'GET',
    SERVER_URL + '/user/stats/v1',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

export function requestGetUsersStat() {
  const res = request(
    'GET',
    SERVER_URL + '/users/stats/v1'
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           helper         ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
export function requestGetResetCode(email: string) {
  const res = request(
    'GET',
    SERVER_URL + '/get/ResetCode',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        email: email,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody('utf-8') as string);
  } else {
    return res.statusCode;
  }
}
