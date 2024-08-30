import { getObjections, Objection, ExaminationType } from './objection';

test('Remove this test and uncomment the tests below', () => {
  expect(1 + 1).toBe(2);
});

describe('argumentative cases', () => {
  test.each([
    {
      question: 'You are totally lying!',
      testimony: 'No you!',
      type: ExaminationType.CROSS,
      objections: new Set([Objection.ARGUMENTATIVE]),
    },
    {
      question: 'This is direct, yes!',
      testimony: 'Yes, so not argumentative!',
      type: ExaminationType.DIRECT,
      objections: new Set([]),
    },
  ])('$objections', ({ question, testimony, type, objections }) => {
    expect(getObjections(question, testimony, type)).toEqual(objections);
  });
});
