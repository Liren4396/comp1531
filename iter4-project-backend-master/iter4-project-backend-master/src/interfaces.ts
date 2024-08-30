export interface notification {
  channelId: number;
  dmId: number;
  notificationMessage: string;
}
export interface channelsJoined {
  numChannelsJoined: number;
  timeStamp: number;
}
export interface dmsJoined {
  numDmsJoined: number;
  timeStamp: number;
}
export interface messagesSent {
  numMessagesSent: number;
  timeStamp: number;
}
export interface userStat {
  channelsJoined: channelsJoined[];
  dmsJoined: dmsJoined[];
  messagesSent: messagesSent[];
  involvementRate?: number;
}

export interface channelsExist {
  numChannelsExist: number;
  timeStamp: number;
}
export interface dmsExist {
  numDmsExist: number;
  timeStamp: number;
}
export interface messagesExist {
  numMessagesExist: number;
  timeStamp: number;
}
export interface workspaceStats {
  channelsExist: channelsExist[];
  dmsExist: dmsExist[];
  messagesExist: messagesExist[];
  utilizationRate?: number;
}

export interface User {
  uId: number;
  token: string[];
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  password: string;
  channelId: number[];
  global_permission: boolean;
  notifications: notification[];
  profileImgUrl: string;
  stats: userStat;
}

export interface userInfo {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

export type Reacts = {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}

export type React = {
  reactId: number,
  uIds: number[],
}

export interface messages {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}

export interface DM {
  id: number;
  creatorId: number;
  name: string;
  memberId: number[];
  members: userInfo[];
  start: number;
  end: number;
  messages: messages[];
}

export interface Channel {
  id: number;
  name: string;
  isPublic: boolean;
  ownerMembers: User[];
  allMembers: User[];
  start: number;
  end: number;
  messages: messages[];
  isStandUpActive: boolean;
  buffer: string[];
  timeFinish: number;
  gameStart: number;
}

export interface ResetInfo {
  email: string,
  resetCode: string
}

export interface Data {
  users?: User[];
  dms?: DM[];
  channels?: Channel[];
  resetCodes?: ResetInfo[];
  stats?: workspaceStats;
}

export interface u1 {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

export type error = { error: string };

export interface userProfile {
  user: userInfo;
}

export type authUserreturntype = {
  authUserId: number,
  token: string
};

export type messageReturnId = {
  messageId: string
};

export type dmReturnId = {
  dmId: number
};

export type DmDetails = {
  name: string,
  members: userInfo[]
};

export type dmInfo = {
  dmId: number,
  name: string
}

export interface dmList {
  dms: dmInfo[]
}
export interface channelDetail {
  name: string;
  isPublic: boolean;
  ownerMembers: userInfo[];
  allMembers: userInfo[];
}

export interface userList {
  users: userInfo[]
}

export type channelregistertype = { channelId: number };
