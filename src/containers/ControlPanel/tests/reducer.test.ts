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

  it('should set show particle tails', () => {
    const expectedResult = Object.assign({}, state, {showParticleTails: false});
    expect(
      controlPanelReducer(undefined, {
        type: 'CONTROL_PANEL_SHOW_PARTICLE_TAILS',
        show: false,
      }),
    ).toEqual(expectedResult);
  });

  it('should set clear particles each frame', () => {
    const expectedResult = Object.assign({}, state, {
      clearParticlesEachFrame: true,
    });
    expect(
      controlPanelReducer(undefined, {
        type: 'CONTROL_PANEL_CLEAR_PARTICLES_EACH_FRAME',
        clear: true,
      }),
    ).toEqual(expectedResult);
  });
});
