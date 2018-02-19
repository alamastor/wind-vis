import {Action} from './actions';

export interface AppState {
  readonly displayParticles: boolean;
  readonly displayVectors: boolean;
}
export const initialState = {
  displayParticles: true,
  displayVectors: false,
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
    default:
      return state;
  }
}
