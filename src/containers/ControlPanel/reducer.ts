import {Action} from './actions';

export interface ControlPanelState {
  readonly displayParticles: boolean;
  readonly displayVectors: boolean;
  readonly paused: boolean;
  readonly showParticleTails: boolean;
  readonly clearParticlesEachFrame: boolean;
}
export const initialState = {
  displayParticles: true,
  displayVectors: false,
  paused: false,
  showParticleTails: true,
  clearParticlesEachFrame: false,
};

export default function controlPanel(
  state: ControlPanelState = initialState,
  action: Action,
) {
  switch (action.type) {
    case 'CONTROL_PANEL_DISPLAY_PARTICLES':
      return Object.assign({}, state, {
        displayParticles: action.display,
      });

    case 'CONTROL_PANEL_DISPLAY_VECTORS':
      return Object.assign({}, state, {
        displayVectors: action.display,
      });

    case 'CONTROL_PANEL_TOGGLE_PAUSE':
      return Object.assign({}, state, {
        paused: !state.paused,
      });

    case 'CONTROL_PANEL_SHOW_PARTICLE_TAILS':
      return Object.assign({}, state, {
        showParticleTails: action.show,
      });

    case 'CONTROL_PANEL_CLEAR_PARTICLES_EACH_FRAME':
      return Object.assign({}, state, {
        clearParticlesEachFrame: action.clear,
      });

    default:
      return state;
  }
}
