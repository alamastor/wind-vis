import {RootAction} from '../../reducers';

export interface State {
  frameRate: number;
  glUnavailable: boolean;
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
