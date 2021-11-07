import {RootAction} from '../../reducers';
import {DateTime} from 'luxon';
import {maxCenterLat, minCenterLat, scalePoint} from '../../utils/mapState';

export const minZoomLevel = 1;
export const maxZoomLevel = 15;

export interface MapVisState {
  readonly cursorLon: number | null;
  readonly cursorLat: number | null;
  readonly cursorU: number | null;
  readonly cursorV: number | null;
  readonly centerLat: number;
  readonly centerLon: number;
  readonly tau: Tau | null;
  readonly displayParticles: boolean; // Show particles component?
  readonly displayVectors: boolean; // Show vectors component?
  readonly displayBackgroundMap: boolean; // Show backgroundMap component?
  readonly displaySpeeds: boolean; // Show wind speeds?
  readonly paused: boolean; // Time stepping is paused?
  readonly zoomLevel: number; // Zoom factor of map. TODO: Consider moving to MapVis.
}
export interface Tau {
  value: number;
  setAt: DateTime;
}

export const initialState = {
  cursorLon: null,
  cursorLat: null,
  cursorU: null,
  cursorV: null,
  centerLat: 0,
  centerLon: 180,
  tau: null,
  displayParticles: true,
  displayVectors: false,
  displayBackgroundMap: true,
  displaySpeeds: true,
  paused: false,
  showParticleTails: true,
  clearParticlesEachFrame: true,
  zoomLevel: 1,
};

export default function (
  state: MapVisState = initialState,
  action: RootAction,
): MapVisState {
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

    case 'MAP_VIS_SET_TAU':
      return Object.assign({}, state, {
        tau: action.tau,
      });

    case 'MAP_VIS_DISPLAY_PARTICLES':
      return Object.assign({}, state, {
        displayParticles: action.display,
      });

    case 'MAP_VIS_DISPLAY_VECTORS':
      return Object.assign({}, state, {
        displayVectors: action.display,
      });

    case 'MAP_VIS_DISPLAY_BACKGROUND_MAP':
      return Object.assign({}, state, {
        displayBackgroundMap: action.display,
      });

    case 'MAP_VIS_DISPLAY_SPEEDS':
      return Object.assign({}, state, {
        displaySpeeds: action.display,
      });

    case 'MAP_VIS_TOGGLE_PAUSE':
      return Object.assign({}, state, {
        paused: !state.paused,
      });

    case 'MAP_VIS_SET_ZOOM_LEVEL':
      return setZoom(
        action.zoomLevel,
        action.mapWidth,
        action.mapHeight,
        state,
      );

    case 'MAP_VIS_MOVE_MAP':
      return moveMap(
        action.deltaX,
        action.deltaY,
        action.mapWidth,
        action.mapHeight,
        state,
      );

    default:
      return state;
  }
}

function setZoom(
  zoomLevel: number,
  canvasWidth: number,
  canvasHeight: number,
  state: MapVisState,
) {
  zoomLevel = Math.min(Math.max(minZoomLevel, zoomLevel), maxZoomLevel);
  const mapState = {
    canvasDims: {
      width: canvasWidth,
      height: canvasHeight,
    },
    zoomLevel: zoomLevel,
    centerCoord: {
      lon: state.centerLon,
      lat: state.centerLat,
    },
  };
  return Object.assign({}, state, {
    centerLat: Math.min(
      Math.max(minCenterLat(mapState), state.centerLat),
      maxCenterLat(mapState),
    ),
    zoomLevel: zoomLevel,
  });
}

function moveMap(
  deltaX: number,
  deltaY: number,
  mapWidth: number,
  mapHeight: number,
  state: MapVisState,
) {
  const mapState = {
    canvasDims: {
      width: mapWidth,
      height: mapHeight,
    },
    zoomLevel: state.zoomLevel,
    centerCoord: {
      lon: state.centerLon,
      lat: state.centerLat,
    },
  };
  const deltaCoord = scalePoint(mapState, {
    x: deltaX,
    y: deltaY,
  });
  return Object.assign({}, state, {
    centerLon: mapState.centerCoord.lon - deltaCoord.lon,
    centerLat: Math.min(
      Math.max(
        minCenterLat(mapState),
        mapState.centerCoord.lat - deltaCoord.lat,
      ),
      maxCenterLat(mapState),
    ),
  });
}
