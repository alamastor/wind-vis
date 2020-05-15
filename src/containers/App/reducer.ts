import {RootAction} from '../../reducers';

export interface State {
  glUnavailable: boolean; // WebGL unavailable in this browser?
}

export const initialState = {
  glUnavailable: false,
};

export default function (
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'APP_SET_GL_UNAVAILABLE':
      return Object.assign({}, state, {glUnavailable: true});
    default:
      return state;
  }
}
