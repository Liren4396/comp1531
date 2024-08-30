import { getData } from './dataStore';
import { isEmpty, tokenToUId } from './helpers';
import HTTPError from 'http-errors';
export function getUserStats(token: string) {
  const data = getData();
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  }
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }

  const authUserId = tokenToUId(token).authorisedId;
  for (const user of data.users) {
    if (user.uId === authUserId) {
      const numChannelsJoined = user.stats.channelsJoined[user.stats.channelsJoined.length - 1].numChannelsJoined;
      const numDmsJoined = user.stats.dmsJoined[user.stats.dmsJoined.length - 1].numDmsJoined;
      const numMessagesSent = user.stats.messagesSent[user.stats.messagesSent.length - 1].numMessagesSent;

      const numChannelsExist = data.stats.channelsExist[data.stats.channelsExist.length - 1].numChannelsExist;
      const numDmsExist = data.stats.dmsExist[data.stats.dmsExist.length - 1].numDmsExist;
      const numMessagesExist = data.stats.messagesExist[data.stats.messagesExist.length - 1].numMessagesExist;

      const denominator = numChannelsExist + numDmsExist + numMessagesExist;

      let involvementRate;
      if (denominator === 0) {
        involvementRate = 0;
      } else {
        involvementRate = (numChannelsJoined + numDmsJoined + numMessagesSent) / denominator;
        if (involvementRate > 1) {
          involvementRate = 1;
        }
      }
      user.stats.involvementRate = involvementRate;
      return { userStats: user.stats };
    }
  }
}

export function getUsersStats() {
  const data = getData();
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  }
  const numOfUser = data.users.length - 1;
  const userJoined = [];
  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      userJoined[member.uId] = member.uId;
    }
  }
  for (const dm of data.dms) {
    userJoined[dm.creatorId] = dm.creatorId;
    for (const member of dm.memberId) {
      userJoined[member] = member;
    }
  }
  const numOfUserJoined = userJoined.length - 1;
  let utilizationRate;

  if (numOfUser === 0) {
    utilizationRate = 0;
  } else {
    utilizationRate = numOfUserJoined / numOfUser;
    if (utilizationRate > 1) {
      utilizationRate = 1;
    }
  }
  return {
    workspaceStats: {
      channelsExist: data.stats.channelsExist,
      dmsExist: data.stats.dmsExist,
      messagesExist: data.stats.messagesExist,
      utilizationRate: utilizationRate
    }
  };
}
