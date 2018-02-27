import reducer, {State, initialState} from '../reducer';

describe('mapVisReducer', () => {
  let state: State;
  beforeEach(() => {
    state = initialState;
  });

  test('set cursor data', () => {
    const expected = Object.assign({}, state, {
      cursorLat: 10,
      cursorLon: 20,
      cursorU: 3,
      cursorV: 1,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_SET_CURSOR',
        lat: 10,
        lon: 20,
        u: 3,
        v: 1,
      }),
    ).toEqual(expected);
  });

  test('reset cursor data', () => {
    state = Object.assign({}, state, {
      cursorLat: 10,
      cursorLon: 20,
      cursorU: 3,
      cursorV: 1,
      centerLat: 10,
      centerLon: 23,
    });
    const expected = Object.assign({}, initialState, {
      centerLat: 10,
      centerLon: 23,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_RESET_CURSOR',
      }),
    ).toEqual(expected);
  });

  test('set mid point', () => {
    const expected = Object.assign({}, state, {
      centerLat: 10,
      centerLon: 30,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_SET_CENTER_POINT',
        lat: 10,
        lon: 30,
      }),
    ).toEqual(expected);
  });
});
