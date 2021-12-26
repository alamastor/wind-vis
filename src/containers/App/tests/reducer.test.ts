import reducer, {initialState, State} from '../reducer';

describe('reducer', () => {
  let state: State;
  beforeEach(() => {
    state = initialState;
  });

  test('set app error', () => {
    const expected = Object.assign({}, state, {glUnavailable: true});
    expect(reducer(state, {type: 'APP_SET_GL_UNAVAILABLE'})).toEqual(expected);
  });
});
