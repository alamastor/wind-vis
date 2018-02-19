import appReducer, {initialState} from '../reducer';

describe('appReducer', () => {
  let state;
  beforeEach(() => {
    state = initialState;
  });

  it('should return the initialState', () => {
    const expectedResult = state;
    expect(appReducer(undefined, {})).toEqual(expectedResult);
  });
});
