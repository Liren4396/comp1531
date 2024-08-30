import validator from 'validator';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';
import { isEmpty, getMaxNumUserId, isEmailTaken, getHashOf } from './helpers';
import { getData, setData } from './dataStore';
import { User, authUserreturntype, error, ResetInfo } from './interfaces';

/**
  * Given a registered user's email and password, returns their authUserId value.
  *
  * @param {string} email - authUser's unique email(account)
  * @param {string} password - password
  * ...
  *
  * @returns {authUserId: number}
  *
*/
export function authLoginV1 (email: string, password: string): authUserreturntype | error {
  const data = getData();

  if (isEmpty(data) || isEmpty(data.users)) {
    throw HTTPError(400, 'empty data');
  }

  // WARNING
  // NEED TO CHANGE CONFLICTING FUNCTIONS WHEN ADDING A SECOND TOKEN

  email = email.toLowerCase();
  password = encryptPassword(password);
  for (const user of data.users) {
    if (user.email === email && user.password === password) {
      // at this point its the correct user, we must push a new token
      const newToken = JSON.stringify(Math.floor(Math.random() * (10000000 + 1)));
      const hashedToken = getHashOf(newToken);
      // Update the user.token with the new token
      user.token.push(hashedToken);
      setData(data);
      return {
        authUserId: user.uId,
        token: newToken
      };
    }
  }

  // Otherwise return an error (because password is wrong)
  throw HTTPError(400, 'password is wrong');
}

/**
  * Given a user's first and last name, email address,
  * and password, creates a new account for them and returns a new authUserId.
  *
  * @param {string} email - authUser's unique email(account)
  * @param {string} password - password
  * @param {string} nameFirst - first name of a person
  * @param {string} nameLast - last name of a person
  * ...
  *
  * @returns {authUserId: number}
  *

  *
*/
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): authUserreturntype | error {
  const data = getData();

  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'invalid email');
  }
  if (password.length < 6) {
    throw HTTPError(400, 'passworld length less than 6');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'first name legnth should >= 1 and <= 50');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'last name legnth should >= 1 and <= 50');
  }
  // email address is already being used by another user
  if (!isEmpty(data)) {
    if (isEmailTaken(email)) {
      throw HTTPError(400, 'email already be used');
    }
  }
  // get correct handlestr when meet same handlestr
  const name = getHandleStr(nameFirst, nameLast);
  let permission = false;
  if (getMaxNumUserId() === 0) {
    permission = true;
  }
  password = encryptPassword(password);

  const newUser: User = {
    uId: getMaxNumUserId() + 1,
    email: email,
    nameFirst: nameFirst,
    nameLast: nameLast,
    handleStr: name,
    password: password,
    channelId: [],
    token: [],
    global_permission: permission,
    notifications: [],
    profileImgUrl: 'https://s1.zerochan.net/Yuuki.Asuna.600.3440883.jpg',
    stats: {
      channelsJoined: [{ numChannelsJoined: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      dmsJoined: [{ numDmsJoined: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      messagesSent: [{ numMessagesSent: 0, timeStamp: Math.floor(Date.now() / 1000) }],
    }
  };
  const newToken = JSON.stringify(Math.floor(Math.random() * (10000000 + 1)));
  const hashedToken = getHashOf(newToken);
  newUser.token.push(hashedToken);
  if (isEmpty(data)) {
    data.users = [];
    data.channels = [];
    data.dms = [];
    data.resetCodes = [];
    data.stats = {
      channelsExist: [{ numChannelsExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      dmsExist: [{ numDmsExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
      messagesExist: [{ numMessagesExist: 0, timeStamp: Math.floor(Date.now() / 1000) }],
    };
  }
  data.users.push(newUser);
  setData(data);

  return {
    authUserId: newUser.uId,
    token: newToken
  };
}

export function authLogoutV1(token: string) {
  const data = getData();

  // Step 1 check if the token exists, doesnt exist then return ERROR
  const user = data.users?.find((user: User) => user.token.includes(token));
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  // At this point there exists a token allocated to a user so we must remove it from the array
  // If there is only 1 token, remove the whole user, we can use splice
  const userIndex = data.users.findIndex((user: User) => user.token.includes(token));
  const founduser = data.users[userIndex];

  founduser.token = founduser.token.filter((t: string) => t !== token);

  setData(data);
  return {};
}

/**
 * sends pw reset code to valid member emails
 * @param email for user who forgot their password
 * @returns {} always
 */
export function authPasswordresetRequestV1(email: string) {
  const data = getData();
  if (isEmpty(data) || isEmpty(data.users)) {
    throw HTTPError(400, 'empty data');
  }
  // do nothing if email is for removed user
  if (email === 'removeduser@email.com') {
    return {};
  }
  const resetCode = Math.random().toString(36).slice(2);
  /* for valid emails -
    remove all user tokens/sessions
    add resetcode to datastore
    email user resetcode
  */
  for (const user of data.users) {
    if (user.email === email) {
      user.token = [];
      const reset: ResetInfo = {
        email: user.email,
        resetCode: resetCode
      };
      data.resetCodes.push(reset);
      sendPwResetEmail(email, resetCode);
    }
  }
  setData(data);
  return {};
}

/**
 * allows users with valid reset codes to change their passwords
 * @param resetCode string of that should be included in email
 * @param newPassword new password that must be longer than 6 characters
 * @returns error message or {}
 */
export function authPasswordresetResetV1(resetCode: string, newPassword: string) {
  const data = getData();
  if (isEmpty(data) || isEmpty(data.users)) {
    throw HTTPError(400, 'empty data');
  }
  if (newPassword.length < 6) {
    throw HTTPError(400, 'passworld length less than 6');
  }
  const email = getResetEmail(resetCode);
  if (email === 'NA') {
    throw HTTPError(400, 'invalid resetCode');
  }
  const index = data.resetCodes.indexOf({ email: email, resetCode: resetCode });
  data.resetCodes.splice(index, 1);

  for (const user of data.users) {
    if (user.email === email) {
      user.password = encryptPassword(newPassword);
    }
  }
  // find user with reset code, update users pw, remove resetCode from dataStore
  setData(data);
  return {};
}
// help function only for authRegister and authLogin
function encryptPassword(password: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', 'secret key');
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function getHandleStr(nameFirst: string, nameLast: string): string {
  // fix handleStr
  let name = (nameFirst + nameLast);
  name = name.toLowerCase();
  name = name.replace(/[^a-zA-Z0-9]/g, '');
  if (name.length > 20) {
    name = name.slice(0, 20);
  }

  // get correct handlestr when meet same handlestr
  const data = getData();
  let count = 0;
  const start = name.length;
  if (!isEmpty(data)) {
    for (const user of data.users) {
      if (user.handleStr === name) {
        name = name.slice(0, start);
        name += count;
        count++;
      }
    }
  }
  return name;
}

function sendPwResetEmail(email: string, resetCode: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'peter.bins@ethereal.email',
      pass: 'pzycMCqF5GRxcRCTSf'
    }
  });

  const text = 'Your password reset code is: ' + resetCode + '. Please ignore if you did not request a password reset';

  const mailOptions = {
    from: 'meme@unsw.nsw.edu.com',
    to: email,
    subject: 'unsw meme password reset',
    text: text
  };

  transporter.sendMail(mailOptions);
}

function getResetEmail(resetCode: string) {
  const data = getData();
  for (const reset of data.resetCodes) {
    if (reset.resetCode === resetCode) {
      return reset.email;
    }
  }
  return 'NA';
}
