import {Action} from './actions';

export interface AppState {
  readonly displayParticles: boolean;
}
const initialState = {
  displayParticles: true,
};

export default function app(state: AppState = initialState, action: Action) {
  switch (action.type) {
    case 'APP_DISPLAY_PARTICLES':
      return Object.assign({}, state, {
        displayParticles: action.display,
      });
    default:
      return state;
  }
}
