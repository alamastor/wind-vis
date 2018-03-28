import controlPanelReducer, {ControlPanelState, initialState} from '../reducer';

describe('controlPanelReducer', () => {
  let state: ControlPanelState;
  beforeEach(() => {
    state = initialState;
  });

  it('should set display particles', () => {
    const expectedResult = Object.assign({}, state, {displayParticles: false});
    expect(
      controlPanelReducer(undefined, {
        type: 'CONTROL_PANEL_DISPLAY_PARTICLES',
        display: false,
      }),
    ).toEqual(expectedResult);
  });

  it('should set display vectors', () => {
    const expectedResult = Object.assign({}, state, {displayVectors: true});
    expect(
      controlPanelReducer(undefined, {
        type: 'CONTROL_PANEL_DISPLAY_VECTORS',
        display: true,
      }),
    ).toEqual(expectedResult);
  });

  it('should set paused', () => {
    const expectedResult = Object.assign({}, state, {paused: true});
    expect(
      controlPanelReducer(undefined, {type: 'CONTROL_PANEL_TOGGLE_PAUSE'}),
    ).toEqual(expectedResult);
  });

  it('should set zoom level', () => {
    const expectedResult = Object.assign({}, state, {
      zoomLevel: 2,
    });
    expect(
      controlPanelReducer(undefined, {
        type: 'CONTROL_PANEL_SET_ZOOM_LEVEL',
        zoomLevel: 2,
      }),
    ).toEqual(expectedResult);
  });
});
