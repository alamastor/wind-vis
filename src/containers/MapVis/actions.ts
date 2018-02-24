import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'MAP_VIS_CURSOR_UPDATE';
      lat: number;
      lon: number;
      u: number;
      v: number;
    }
  | {type: 'MAP_VIS_CURSOR_RESET'};

export function updateCursorData(
  lat: number,
  lon: number,
  u: number,
  v: number,
): RootAction {
  return {
    type: 'MAP_VIS_CURSOR_UPDATE',
    lat: lat,
    lon: lon,
    u: u,
    v: v,
  };
}

export function resetCursorData(): RootAction {
  return {type: 'MAP_VIS_CURSOR_RESET'};
}
