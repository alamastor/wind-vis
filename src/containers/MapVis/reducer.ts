import {Action} from './actions';
import {RootAction} from '../../reducers';

export interface State {
  cursorLon: number | null;
  cursorLat: number | null;
  cursorU: number | null;
  cursorV: number | null;
  centerLat: number;
  centerLon: number;
}

export const initialState = {
  cursorLon: null,
  cursorLat: null,
  cursorU: null,
  cursorV: null,
  centerLat: 0,
  centerLon: 180,
};

export default function(
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'MAP_VIS_SET_CURSOR':
      return Object.assign({}, state, {
        cursorLon: action.lon,
        cursorLat: action.lat,
        cursorU: action.u,
        cursorV: action.v,
      });

    case 'MAP_VIS_RESET_CURSOR':
      return Object.assign({}, state, {
        cursorLon: initialState.cursorLon,
        cursorLat: initialState.cursorLat,
        cursorU: initialState.cursorU,
        cursorV: initialState.cursorV,
      });

    case 'MAP_VIS_SET_CENTER_POINT':
      return Object.assign({}, state, {
        centerLon: action.lon,
        centerLat: action.lat,
      });

    default:
      return state;
  }
}
