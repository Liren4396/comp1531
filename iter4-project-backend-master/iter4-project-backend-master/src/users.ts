import validator from 'validator';
import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { authUserIdValid, tokenToUId, isEmpty, getUserInfo, isEmailTaken } from './helpers';
import { error } from './interfaces';
import fs from 'fs';
import { port, url } from './config.json';
import sizeOf from 'image-size';
import request from 'sync-request';
import sharp from 'sharp';

const SERVER_URL = `${url}:${port}`;

/**
  * <Function takes authUserId and uId as an input and outputs the user object for uId>
  *
  * @param {string} token - ID of the user
  * @param {number} uId - The displayed user profile's ID
  * ...
  *
  * @returns {object} - user object
  * @returns {object} - error
*/
export function userProfileV1(token: string, uId: number) {
  // checking whether the data passed in is empty or not
  if (isEmpty(getData())) {
    throw HTTPError(400, 'empty data');
  }

  const data = getData();
  // chhecking whether token is valid
  if (isEmpty(tokenToUId(token))) {
    throw HTTPError(403, 'invalid token');
  }

  // checking if both authUserId and uId are valid
  if (authUserIdValid(uId) !== true) {
    throw HTTPError(400, 'authUserId or uId is invalid');
  }

  for (const user of data.users) {
    if (user.uId === uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
          profileImgUrl: user.profileImgUrl
        }
      };
    }
  }
}

/**
  * Update the authorised user's handle (i.e. display name)
  *
  * @param {string} token - ID of the user

  * @param {string} handleStr - The displayed user profile's ID
  * ...
  *
  * @returns {} - empty object
*/
export function usersethandlev1(token: string, handleStr: string) {
  // length of handleStr is not between 3 and 20 characters inclusive
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'length of handleStr is not between 3 and 20 characters inclusive');
  }
  // handleStr contains characters that are not alphanumeric
  const arr = handleStr.match(/[^a-zA-Z0-9]/);
  if (!isEmpty(arr)) {
    throw HTTPError(400, 'handleStr contains characters that are not alphanumeric');
  }
  const data = getData();
  // the handle is already used by another user
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  }
  for (const user of data.users) {
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'the handle is already used by another user');
    }
  }
  const auth = tokenToUId(token);
  // token is invalid
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }

  // start update the user's handle
  for (const user of data.users) {
    if (user.uId === auth.authorisedId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
}

/**
 * Update the authorised user's first and last name
 *
 * @param {string} token - ID of the user
 * @param {string} nameFirst - first name of user
 * @param {string} nameLast - last name of user
 *
 * ...
 *
 * @returns {object} - nothing
 * @returns {object} - ERROR
 */
export function userProfileSetnameV1(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  }
  // ERROR CASE: length of nameFirst is not between 1 and 50 characters inclusive
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  }
  // ERROR CASE: length of nameLast is not between 1 and 50 characters inclusive
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }
  // ERROR CASE: token is invalid
  const auth = tokenToUId(token);
  if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  // set name
  const authUserId = auth.authorisedId;
  data.users[authUserId - 1].nameFirst = nameFirst;
  data.users[authUserId - 1].nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * function that lists out all users in server
 * @param token token of any session of any user in the server
 * @returns list of user details or error message upon failure
 */
export function usersAllV1(token: string): object | error {
  const data = getData();
  const auth = tokenToUId(token);
  if (isEmpty(data)) {
    throw HTTPError(403, 'empty data');
  } else if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  }
  const list = [];
  for (const user of data.users) {
    if (user.handleStr !== 'removeduser') {
      const u = getUserInfo(user.uId);
      list.push(u);
    }
  }
  return { users: list };
}

/**
 * function that updates the user's email
 * @param token token of any user session
 * @param email new email of user
 * @returns error message upon failure or {} upon sucessful update
 */
export function userProfileSetemailV1(token: string, email: string): object | error {
  const data = getData();
  const auth = tokenToUId(token);
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  } else if (JSON.stringify(auth) === '{}') {
    throw HTTPError(403, 'invalid token');
  } else if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'invalid email');
  } else if (isEmailTaken(email)) {
    throw HTTPError(400, 'email already be used');
  }

  const authUserId = auth.authorisedId;
  data.users[authUserId - 1].email = email;
  setData(data);
  return {};
}
/**
 * update user's photo that can be shown on web
 * @param string token of any user session
 * @param string imgUrl url of the photo
 * @param number xStart horizontal start position
 * @param number yStart vertical start position
 * @param number xEnd horizontal end position
 * @param number yEnd vertical end position
 * @returns error message upon failure or {} upon sucessful update
 */
export function userProfileUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const data = getData();
  const auth = tokenToUId(token);
  if (isEmpty(data)) {
    throw HTTPError(400, 'empty data');
  } else if (JSON.stringify(auth) === '{}') {
    throw HTTPError(400, 'fail to change token to uId');
  }
  const authUserId = auth.authorisedId;

  if (imgUrl.match(/\.(jpg|jpeg)$/) === null) {
    throw HTTPError(400, 'imgUrl not a jpg');
  }
  // xEnd is less than or equal to xStart or yEnd is less than or equal to yStart
  if (xStart >= xEnd || yStart >= yEnd) {
    throw HTTPError(400, 'xEnd is less than or equal to xStart or yEnd is less than or equal to yStart');
  }
  for (const user of data.users) {
    if (user.uId === authUserId && user.profileImgUrl === imgUrl) {
      return {};
    }
  }
  let res;
  try {
    res = request('GET', imgUrl);
    // imgUrl returns an HTTP status other than 200, or any other errors occur when attempting to retrieve the image
    if (res.statusCode !== 200) {
      throw HTTPError(400, '400 error');
    }
  } catch (err) {
    throw HTTPError(400, 'get image error');
  }
  const body = res.body;
  const imgPath = `img/${authUserId}.jpg`;
  const cropImage = `img/img_${authUserId}.jpg`;
  if (!fs.existsSync('img')) {
    fs.mkdirSync('img');
  }

  fs.writeFileSync(imgPath, body);

  fs.writeFileSync(imgPath, body, { flag: 'w' });
  // get dimensions
  const dimensions = sizeOf(imgPath);
  const x = dimensions.width;
  const y = dimensions.height;
  // dimension errors
  if (xEnd > x || xStart < 0 || yEnd > y || yStart < 0) {
    throw HTTPError(400, 'xEnd is less than or equal to xStart or yEnd is less than or equal to yStart');
  }
  // crop image
  sharp(imgPath).extract({ width: xEnd - xStart, height: yEnd - yStart, left: 0, top: 0 }).toFile(cropImage);

  // set users profile img url
  for (const user of data.users) {
    if (user.uId === authUserId) {
      user.profileImgUrl = `${SERVER_URL}/${cropImage}`;
    }
  }
  setData(data);
  return {};
}
