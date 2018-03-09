import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'MAP_VIS_SET_CURSOR';
      lon: number;
      lat: number;
      u: number;
      v: number;
    }
  | {type: 'MAP_VIS_RESET_CURSOR'}
  | {type: 'MAP_VIS_SET_CENTER_POINT'; lon: number; lat: number};

export function setCursorData(
  lon: number,
  lat: number,
  u: number,
  v: number,
): RootAction {
  return {
    type: 'MAP_VIS_SET_CURSOR',
    lon: lon,
    lat: lat,
    u: u,
    v: v,
  };
}

export function resetCursorData(): RootAction {
  return {type: 'MAP_VIS_RESET_CURSOR'};
}

export function setCenterPoint(lon: number, lat: number): RootAction {
  return {type: 'MAP_VIS_SET_CENTER_POINT', lon: lon, lat: lat};
}
