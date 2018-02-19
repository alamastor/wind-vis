import {Action} from './actions';

export interface ControlPanelState {
  readonly displayParticles: boolean;
  readonly displayVectors: boolean;
  readonly paused: boolean;
}
export const initialState = {
  displayParticles: true,
  displayVectors: false,
  paused: false,
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
    default:
      return state;
  }
}
