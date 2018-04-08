import reducer, {State, initialState} from '../reducer';

describe('reducer', () => {
  let state: State;
  beforeEach(() => {
    state = initialState;
  });

  test('set frame rate', () => {
    const expected = Object.assign({}, state, {frameRate: 10});
    expect(
      reducer(state, {
        type: 'APP_SET_FRAME_RATE',
        frameRate: 10,
      }),
    ).toEqual(expected);
  });

  test('set app error', () => {
    const expected = Object.assign({}, state, {glUnavailable: true});
    expect(reducer(state, {type: 'APP_SET_GL_UNAVAILABLE'})).toEqual(expected);
  });
});
