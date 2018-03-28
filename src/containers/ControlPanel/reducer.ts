import {Action} from './actions';

export const minZoomLevel = 1;
export const maxZoomLevel = 15;

export interface ControlPanelState {
  readonly displayParticles: boolean;
  readonly displayVectors: boolean;
  readonly paused: boolean;
  readonly zoomLevel: number;
}
export const initialState = {
  displayParticles: true,
  displayVectors: false,
  paused: false,
  showParticleTails: true,
  clearParticlesEachFrame: true,
  zoomLevel: 1,
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

    case 'CONTROL_PANEL_SET_ZOOM_LEVEL':
      const zoomLevel = Math.min(
        Math.max(minZoomLevel, action.zoomLevel),
        maxZoomLevel,
      );
      return Object.assign({}, state, {
        zoomLevel: zoomLevel,
      });

    default:
      return state;
  }
}
