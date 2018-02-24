import reducer, {State, initialState} from '../reducer';

describe('mapVisReducer', () => {
  let state: State;
  beforeEach(() => {
    state = initialState;
  });

  test('it should set values correctly', () => {
    const expected = Object.assign({}, state, {lat: 10, lon: 20, u: 3, v: 1});
    expect(
      reducer(state, {
        type: 'MAP_VIS_CURSOR_UPDATE',
        lat: 10,
        lon: 20,
        u: 3,
        v: 1,
      }),
    ).toEqual(expected);
  });

  test('it should get reset correctly', () => {
    state = reducer(state, {
      type: 'MAP_VIS_CURSOR_UPDATE',
      lat: 10,
      lon: 20,
      u: 3,
      v: 1,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_CURSOR_RESET',
      }),
    ).toEqual(initialState);
  });
});
