import {Action} from './actions';
import {RootAction} from '../../reducers';

export interface State {
  cursorLat: number | null;
  cursorLon: number | null;
  cursorU: number | null;
  cursorV: number | null;
  centerLat: number;
  centerLon: number;
}

export const initialState = {
  cursorLat: null,
  cursorLon: null,
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
        cursorLat: action.lat,
        cursorLon: action.lon,
        cursorU: action.u,
        cursorV: action.v,
      });

    case 'MAP_VIS_RESET_CURSOR':
      return Object.assign({}, state, {
        cursorLat: initialState.cursorLat,
        cursorLon: initialState.cursorLon,
        cursorU: initialState.cursorU,
        cursorV: initialState.cursorV,
      });

    case 'MAP_VIS_SET_CENTER_POINT':
      return Object.assign({}, state, {
        centerLat: action.lat,
        centerLon: action.lon,
      });

    default:
      return state;
  }
}
