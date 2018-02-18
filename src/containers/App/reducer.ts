import {Action} from './actions';
import {DISPLAY_PARTICLES} from './constants';

export interface AppState {
  displayParticles: boolean;
}
const initialState = {
  displayParticles: true,
};

export default function app(state: AppState = initialState, action: Action) {
  switch (action.type) {
    case DISPLAY_PARTICLES:
      return Object.assign({}, state, {
        displayParticles: action.display,
      });
    default:
      return state;
  }
}
