import {Action} from './actions';

export interface State {
  lat: number | null;
  lon: number | null;
  u: number | null;
  v: number | null;
}

export const initialState = {
  lat: null,
  lon: null,
  u: null,
  v: null,
};

export default function(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'MAP_VIS_CURSOR_UPDATE':
      return Object.assign({}, state, {
        lat: action.lat,
        lon: action.lon,
        u: action.u,
        v: action.v,
      });

    case 'MAP_VIS_CURSOR_RESET':
      return initialState;

    default:
      return state;
  }
}
