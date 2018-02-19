import {Action} from './actions';

export interface AppState {
  readonly displayParticles: boolean;
  readonly displayVectors: boolean;
  readonly paused: boolean;
}
export const initialState = {
  displayParticles: true,
  displayVectors: false,
  paused: false,
};

export default function app(state: AppState = initialState, action: Action) {
  switch (action.type) {
    case 'APP_DISPLAY_PARTICLES':
      return Object.assign({}, state, {
        displayParticles: action.display,
      });

    case 'APP_DISPLAY_VECTORS':
      return Object.assign({}, state, {
        displayVectors: action.display,
      });

    case 'APP_TOGGLE_PAUSE':
      return Object.assign({}, state, {
        paused: !state.paused,
      });
    default:
      return state;
  }
}
