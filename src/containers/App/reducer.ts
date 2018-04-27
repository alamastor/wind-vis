import {RootAction} from '../../reducers';

export interface State {
  frameRate: number; // Recorded current frame rate of app. Time lagged.
  glUnavailable: boolean; // WebGL unavailable in this browser?
}

export const initialState = {
  frameRate: 60,
  glUnavailable: false,
};

export default function(
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'APP_SET_FRAME_RATE':
      return Object.assign({}, state, {frameRate: action.frameRate});
    case 'APP_SET_GL_UNAVAILABLE':
      return Object.assign({}, state, {glUnavailable: true});
    default:
      return state;
  }
}
