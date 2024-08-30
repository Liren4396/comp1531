import {
  requestAuthRegister,
  requestChannelsCreate,
  requestUsersAll,
  requestClear
} from './FunctionForTest';

import { getData } from './dataStore';

function clearV1() {
  requestClear();
}
// test for clearV1
describe('clearV1 Test', () => {
  // test for users
  test('clearV1 Test: return {}?', () => {
    const person = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    requestChannelsCreate(person.token, 'mychannel', true);

    clearV1();
    const data = getData();
    expect(data).toEqual({});
  });

  test('course test: using function after clear', () => {
    const person = requestAuthRegister('z5369144@ad.unsw.edu.au', 'Kkkkk4396', 'Liren', 'Ding');
    clearV1();
    expect(requestUsersAll(person.token)).toStrictEqual(403);
  });
});
