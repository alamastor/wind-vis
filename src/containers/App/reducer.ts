import {RootAction} from '../../reducers';

export interface State {
  frameRate: number;
}

export const initialState = {
  frameRate: 60,
};

export default function(
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'APP_SET_FRAME_RATE':
      return Object.assign({}, state, {frameRate: action.frameRate});
    default:
      return state;
  }
}
