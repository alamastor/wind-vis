import {RootAction} from '../../reducers';
import {Tau} from './reducer';

export type Action =
  | {
      type: 'MAP_VIS_SET_CURSOR';
      lon: number;
      lat: number;
      u: number;
      v: number;
    }
  | {type: 'MAP_VIS_RESET_CURSOR'}
  | {
      type: 'MAP_VIS_MOVE_MAP';
      deltaX: number;
      deltaY: number;
      mapWidth: number;
      mapHeight: number;
    }
  | {type: 'MAP_VIS_SET_TAU'; tau: Tau}
  | {
      type: 'MAP_VIS_DISPLAY_PARTICLES';
      display: boolean;
    }
  | {
      type: 'MAP_VIS_DISPLAY_VECTORS';
      display: boolean;
    }
  | {
      type: 'MAP_VIS_DISPLAY_SPEEDS';
      display: boolean;
    }
  | {
      type: 'MAP_VIS_DISPLAY_BACKGROUND_MAP';
      display: boolean;
    }
  | {
      type: 'MAP_VIS_TOGGLE_PAUSE';
    }
  | {
      type: 'MAP_VIS_SET_ZOOM_LEVEL';
      zoomLevel: number;
      mapWidth: number;
      mapHeight: number;
    };

export function setCursorData(
  lon: number,
  lat: number,
  u: number,
  v: number,
): RootAction {
  return {
    type: 'MAP_VIS_SET_CURSOR',
    lon,
    lat,
    u,
    v,
  };
}

export function resetCursorData(): RootAction {
  return {type: 'MAP_VIS_RESET_CURSOR'};
}

export function setTau(tau: Tau): RootAction {
  return {type: 'MAP_VIS_SET_TAU', tau};
}

export function setDisplayParticles(display: boolean): RootAction {
  return {
    type: 'MAP_VIS_DISPLAY_PARTICLES',
    display,
  };
}

export function setDisplayVectors(display: boolean): RootAction {
  return {
    type: 'MAP_VIS_DISPLAY_VECTORS',
    display,
  };
}

export function setDisplaySpeeds(display: boolean): RootAction {
  return {
    type: 'MAP_VIS_DISPLAY_SPEEDS',
    display,
  };
}

export function setDisplayBackgroundMap(display: boolean): RootAction {
  return {
    type: 'MAP_VIS_DISPLAY_BACKGROUND_MAP',
    display,
  };
}

export function togglePaused(): RootAction {
  return {type: 'MAP_VIS_TOGGLE_PAUSE'};
}

export function setZoomLevel(
  zoomLevel: number,
  mapWidth: number,
  mapHeight: number,
): RootAction {
  return {
    type: 'MAP_VIS_SET_ZOOM_LEVEL',
    zoomLevel,
    mapWidth,
    mapHeight,
  };
}

export function moveMap(
  deltaX: number,
  deltaY: number,
  mapWidth: number,
  mapHeight: number,
): RootAction {
  return {
    type: 'MAP_VIS_MOVE_MAP',
    deltaX,
    deltaY,
    mapWidth,
    mapHeight,
  };
}
