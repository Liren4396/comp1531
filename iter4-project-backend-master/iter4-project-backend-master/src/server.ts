import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import { adminUserpermissionChangeV1, adminUserRemoveV1 } from './admin';
import { authRegisterV1, authLoginV1, authLogoutV1, authPasswordresetRequestV1, authPasswordresetResetV1 } from './auth';
import { channelDetailsV1, channelInviteV1, channeladdownerV1, channelremoveownerV1, channelJoinV1, channelMessagesV1, channelLeaveV1 } from './channel';
import { channelsCreateV1, channelsListAllV1, channelsListV1 } from './channels';
import { messageSearch, messageEditV1, messageSendV1, messageSendDmV1, messageRemoveV1, messageReactV1, messageUnreactV1, messagePinV1, messageUnpinV1, getNotification, messageSendLater, DMmessageSendLater, messageShareV1 } from './message';
import { dmRemoveV1, dmDetailsV1, dmCreateV1, dmMessagesV1, dmListV1, dmLeaveV1 } from './dm';
import { usersethandlev1, userProfileV1, userProfileSetnameV1, usersAllV1, userProfileSetemailV1, userProfileUploadPhoto } from './users';
import { standupStart, standupActive, standupSend } from './standup';
import { clearV1 } from './other';
import errorHandler from 'middleware-http-errors';
import { getHashOf, getResetCode } from './helpers';
import { getUserStats, getUsersStats } from './stats';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for upload photo
app.use('/img', express.static('img'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           authUser             /////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1) /auth/login/v2
app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  const { email, password } = req.body;

  return res.json(authLoginV1(email, password));
});

// 2) /auth/register/v3
app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  const { email, password, nameFirst, nameLast } = req.body;

  return res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

// 12) /auth/logout/v1
app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));

  return res.json(authLogoutV1(token));
});

// /auth/passwordreset/reset/v1
app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next) => {
  const { resetCode, newPassword } = req.body;

  return res.json(authPasswordresetResetV1(resetCode, newPassword));
});

// auth/passwordreset/request/v1
app.post('/auth/passwordreset/request/v1', (req: Request, res: Response, next) => {
  const { email } = req.body;

  return res.json(authPasswordresetRequestV1(email));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// /////////////////////////           Channels             ////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3) /channels/create/v2
app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  const { name, isPublic } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channelsCreateV1(token, name, isPublic));
});

// 4) /channels/list/v2
app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(channelsListV1(token));
});

// 5) /channels/listall/v2
app.get('/channels/listall/v3', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(channelsListAllV1(token));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Channel             //////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

// 6) /channel/details/v2
app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const channelId = parseInt(req.query.channelId as string);
  return res.json(channelDetailsV1(token, channelId));
});

// 7) /channel/join/v2
app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channelJoinV1(token, channelId));
});

// 8) /channel/invite/v2
app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  const { channelId, uId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channelInviteV1(token, channelId, uId));
});
// 9) /channel/messages/v3
app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const channelId = parseInt(req.query.channelId as string);
  const start = parseInt(req.query.start as string);
  return res.json(channelMessagesV1(token, channelId, start));
});

// 13) /channel/leave/v1
app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  const { channelId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channelLeaveV1(token, channelId));
});

// 14) /channel/addowner/v2
app.post('/channel/addowner/v2', (req: Request, res: Response, next) => {
  const { channelId, uId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channeladdownerV1(token, channelId, uId));
});

// 15) /channel/removeowner/v1
app.post('/channel/removeowner/v2', (req: Request, res: Response, next) => {
  const { channelId, uId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(channelremoveownerV1(token, channelId, uId));
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////          Message             ///////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/search/v1', (req: Request, res: Response, next) => {
  const queryStr = req.query.queryStr as string;
  const token = getHashOf(req.header('token'));
  return res.json(messageSearch(token, queryStr));
});

// 16) /message/send/v1
app.post('/message/send/v2', (req: Request, res: Response, next) => {
  const { channelId, message } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageSendV1(token, channelId, message));
});

// 17) /message/edit/v1
app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  const { messageId, message } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageEditV1(token, messageId, message));
});
// 18) /message/remove/v1
app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const messageId = parseInt(req.query.messageId as string);
  return res.json(messageRemoveV1(token, messageId));
});
// 25) /message/senddm/v1
app.post('/message/senddm/v2', (req: Request, res: Response, next) => {
  const { dmId, message } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageSendDmV1(token, dmId, message));
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  const { ogMessageId, message, channelId, dmId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  const { messageId, reactId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageReactV1(token, messageId, reactId));
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  const { messageId, reactId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageUnreactV1(token, messageId, reactId));
});

// message/sendlater/v1
app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  let { channelId, message, timeSent } = req.body;
  channelId = parseInt(channelId);
  timeSent = parseInt(timeSent);
  const token = getHashOf(req.header('token'));
  return res.json(messageSendLater(token, channelId, message, timeSent));
});

// message/pin/v1
app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  const { messageId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messagePinV1(token, messageId));
});

// message/unpin/v1
app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  const { messageId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(messageUnpinV1(token, messageId));
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  let { dmId, message, timeSent } = req.body;
  dmId = parseInt(dmId);
  timeSent = parseInt(timeSent);
  const token = getHashOf(req.header('token'));
  return res.json(DMmessageSendLater(token, dmId, message, timeSent));
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(getNotification(token));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           DM             ///////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// 19) /dm/create/v1
app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  const { uIds } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(dmCreateV1(token, uIds));
});
// 20) /dm/list/v1
app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(dmListV1(token));
});
// 21) /dm/remove/v2
app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmRemoveV1(token, dmId));
});
// 22) /dm/details/v1
app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const dmId = parseInt(req.query.dmId as string);
  return res.json(dmDetailsV1(token, dmId));
});
// 23) /dm/leave/v1
app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  const { dmId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(dmLeaveV1(token, dmId));
});

// 24) /dm/messages/v1
app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);
  return res.json(dmMessagesV1(token, dmId, start));
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           Clear            /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

// 11) /clear/v1
app.delete('/clear/v1', (req: Request, res: Response, next) => {
  return res.json(clearV1());
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           User             /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////

// 10) /user/profile/v2
app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const uId = parseInt(req.query.uId as string);

  return res.json(userProfileV1(token, uId));
});

// 26) /users/all/v1
app.get('/users/all/v2', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(usersAllV1(token));
});

// 27) /user/profile/setname/v1
app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  const { nameFirst, nameLast } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(userProfileSetnameV1(token, nameFirst, nameLast));
});

// 28) /user/profile/setemail/v1
app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  const { email } = req.body;
  const token = getHashOf(req.header('token'));

  return res.json(userProfileSetemailV1(token, email));
});

// 29) /user/profile/sethandle/v2
app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  const { handleStr } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(usersethandlev1(token, handleStr));
});

// user/profile/uploadphoto/v1

app.post('/user/profile/uploadphoto/v1', (req: Request, res: Response, next) => {
  let { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
  xStart = parseInt(xStart);
  yStart = parseInt(yStart);
  xEnd = parseInt(xEnd);
  yEnd = parseInt(yEnd);

  const token = getHashOf(req.header('token'));
  return res.json(userProfileUploadPhoto(token, imgUrl, xStart, yStart, xEnd, yEnd));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////           admin            /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  const { uId, permissionId } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(adminUserpermissionChangeV1(token, uId, permissionId));
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const uId = parseInt(req.query.uId as string);
  return res.json(adminUserRemoveV1(token, uId));
});

// admin/user/remove/v1
app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const uId = parseInt(req.query.uId as string);
  return res.json(adminUserRemoveV1(token, uId));
});

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////         standup            /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  let { channelId, length } = req.body;
  const token = getHashOf(req.header('token'));
  length = parseInt(length);
  return res.json(standupStart(token, channelId, length));
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  const channelId = parseInt(req.query.channelId as string);
  return res.json(standupActive(token, channelId));
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  const { channelId, message } = req.body;
  const token = getHashOf(req.header('token'));
  return res.json(standupSend(token, channelId, message));
});

// helper function
app.get('/get/ResetCode', (req: Request, res: Response, next) => {
  const email = req.query.email as string;
  return res.json(getResetCode(email));
});
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////         stat               /////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  const token = getHashOf(req.header('token'));
  return res.json(getUserStats(token));
});
app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  return res.json(getUsersStats());
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////    Do Not add server function beneath here        /////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Keep this BENEATH route definitions
// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
