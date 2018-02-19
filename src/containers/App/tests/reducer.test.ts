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

  it('should set display particles', () => {
    const expectedResult = Object.assign({}, state, {displayParticles: false});
    expect(
      appReducer(undefined, {type: 'APP_DISPLAY_PARTICLES', display: false}),
    ).toEqual(expectedResult);
  });

  it('should set display vectors', () => {
    const expectedResult = Object.assign({}, state, {displayVectors: true});
    expect(
      appReducer(undefined, {type: 'APP_DISPLAY_VECTORS', display: true}),
    ).toEqual(expectedResult);
  });
});
