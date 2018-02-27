import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'MAP_VIS_SET_CURSOR';
      lat: number;
      lon: number;
      u: number;
      v: number;
    }
  | {type: 'MAP_VIS_RESET_CURSOR'}
  | {type: 'MAP_VIS_SET_CENTER_POINT'; lat: number; lon: number};

export function setCursorData(
  lat: number,
  lon: number,
  u: number,
  v: number,
): RootAction {
  return {
    type: 'MAP_VIS_SET_CURSOR',
    lat: lat,
    lon: lon,
    u: u,
    v: v,
  };
}

export function resetCursorData(): RootAction {
  return {type: 'MAP_VIS_RESET_CURSOR'};
}

export function setCenterPoint(lat: number, lon: number): RootAction {
  return {type: 'MAP_VIS_SET_CENTER_POINT', lat: lat, lon: lon};
}
