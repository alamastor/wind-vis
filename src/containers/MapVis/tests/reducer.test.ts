import reducer, {initialState, MapVisState} from '../reducer';

describe('mapVisReducer', () => {
  let state: MapVisState;
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

  test('move map', () => {
    // Have to zoom in to un-constrain vertical movement.
    state = reducer(state, {
      type: 'MAP_VIS_SET_ZOOM_LEVEL',
      zoomLevel: 2,
      mapWidth: 500,
      mapHeight: 500,
    });
    const expected = Object.assign({}, state, {
      centerLat: 5.4,
      centerLon: 126,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_MOVE_MAP',
        deltaX: 300,
        deltaY: 30,
        mapWidth: 500,
        mapHeight: 500,
      }),
    ).toEqual(expected);
  });

  it('should set display particles', () => {
    const expectedResult = Object.assign({}, state, {displayParticles: false});
    expect(
      reducer(undefined, {
        type: 'MAP_VIS_DISPLAY_PARTICLES',
        display: false,
      }),
    ).toEqual(expectedResult);
  });

  it('should set display vectors', () => {
    const expectedResult = Object.assign({}, state, {displayVectors: true});
    expect(
      reducer(undefined, {
        type: 'MAP_VIS_DISPLAY_VECTORS',
        display: true,
      }),
    ).toEqual(expectedResult);
  });

  it('should set paused', () => {
    const expectedResult = Object.assign({}, state, {paused: true});
    expect(reducer(undefined, {type: 'MAP_VIS_TOGGLE_PAUSE'})).toEqual(
      expectedResult,
    );
  });

  it('should set zoom level', () => {
    const expectedResult = Object.assign({}, state, {
      zoomLevel: 2,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_SET_ZOOM_LEVEL',
        zoomLevel: 2,
        mapWidth: 500,
        mapHeight: 500,
      }),
    ).toEqual(expectedResult);
  });

  it('should constrain center lat while zooming', () => {
    // Zoom in
    state = reducer(state, {
      type: 'MAP_VIS_SET_ZOOM_LEVEL',
      zoomLevel: 2,
      mapWidth: 500,
      mapHeight: 500,
    });
    // Pan to bottom of map
    state = reducer(state, {
      type: 'MAP_VIS_MOVE_MAP',
      deltaX: 0,
      deltaY: -1000,
      mapWidth: 500,
      mapHeight: 500,
    });
    expect(state).toEqual(
      Object.assign({}, state, {
        zoomLevel: 2,
        centerLat: -45,
      }),
    );
    // Zoom back out - centre lat should move back to zero
    const expectedResult = Object.assign({}, state, {
      zoomLevel: 1,
      centerLat: 0,
    });
    expect(
      reducer(state, {
        type: 'MAP_VIS_SET_ZOOM_LEVEL',
        zoomLevel: 1,
        mapWidth: 500,
        mapHeight: 500,
      }),
    ).toEqual(expectedResult);
  });
});
