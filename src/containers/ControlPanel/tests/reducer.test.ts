import appReducer, {AppState, initialState} from '../reducer';

describe('appReducer', () => {
  let state: AppState;
  beforeEach(() => {
    state = initialState;
  });

  it('should set display particles', () => {
    const expectedResult = Object.assign({}, state, {displayParticles: false});
    expect(
      appReducer(undefined, {
        type: 'CONTROL_PANEL_DISPLAY_PARTICLES',
        display: false,
      }),
    ).toEqual(expectedResult);
  });

  it('should set display vectors', () => {
    const expectedResult = Object.assign({}, state, {displayVectors: true});
    expect(
      appReducer(undefined, {
        type: 'CONTROL_PANEL_DISPLAY_VECTORS',
        display: true,
      }),
    ).toEqual(expectedResult);
  });

  it('should set paused', () => {
    const expectedResult = Object.assign({}, state, {paused: true});
    expect(appReducer(undefined, {type: 'CONTROL_PANEL_TOGGLE_PAUSE'})).toEqual(
      expectedResult,
    );
  });
});
