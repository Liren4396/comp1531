/**
 * @see password
 * @module password.test
 */

import { checkPassword } from './password';

test('Remove this test and uncomment the other tests below', () => {
  expect(1 + 1).toEqual(2);
});


// You can remove or replace this with your own tests.
// TIP: you may want to explore "test.each"
describe('Example block of tests', () => {
  test('Example test 1', () => {
    expect(checkPassword('Dingliren4396')).toEqual('Strong Password');
  });

  test('Example test 2', () => {
    expect(checkPassword('Kirito4396')).toEqual('Moderate Password');
  });

  test('Example test 3', () => {
    expect(checkPassword('12345')).toEqual('Horrible Password');
  });

  test('Example test 4', () => {
    expect(checkPassword('ASDFKJjlklkj123')).toEqual('Strong Password');
  });
  
  test('Example test 5', () => {
    expect(checkPassword('dingliren4396')).toEqual('Moderate Password');
  });
  
  test('Example test 6', () => {
    expect(checkPassword('DINGLIREN4396')).toEqual('Moderate Password');
  });
  
  test('Example test 7', () => {
    expect(checkPassword('5644654566543531')).toEqual('Poor Password');
  });
  
  test('Example test 8', () => {
    expect(checkPassword('4864879987')).toEqual('Poor Password');
  });
  
  test('Example test 9', () => {
    expect(checkPassword('555555555555')).toEqual('Poor Password');
  });
  
  test('Example test 10', () => {
    expect(checkPassword('Nino_Miku_Yotsuba_5:)')).toEqual('Strong Password');
  });

});

