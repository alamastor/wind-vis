import {Point, Coord} from '../types';

export interface MapState {
  canvasDims: {width: number; height: number};
  zoomLevel: number;
  centerCoord: Coord;
}

export function scaleCoord(mapState: MapState, coord: Coord): Point {
  const {canvasDims, zoomLevel} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const transformedX =
    ((canvasDims.width * coord.lon) / 180) * (1 / Math.min(2, aspectRatio));
  const transformedY =
    ((-canvasDims.height * coord.lat) / 360) * Math.max(2, aspectRatio);
  const scaledX = transformedX * zoomLevel;
  const scaledY = transformedY * zoomLevel;
  return {
    x: scaledX,
    y: scaledY,
  };
}

export function transformCoord(mapState: MapState, coord: Coord): Point {
  const {canvasDims, centerCoord, zoomLevel} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedX =
    canvasDims.width / 2 -
    ((canvasDims.width * (180 - coord.lon + lonOffset)) / 180) *
      (1 / Math.min(2, aspectRatio)) *
      zoomLevel;
  const transformedY =
    canvasDims.height / 2 -
    ((canvasDims.height * (coord.lat - latOffset)) / 360) *
      Math.max(2, aspectRatio) *
      zoomLevel;
  return {
    x: transformedX,
    y: transformedY,
  };
}

export function scalePoint(mapState: MapState, point: Point): Coord {
  const {canvasDims, zoomLevel} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const transformedLon =
    (Math.min(2, aspectRatio) * 180 * point.x) / (canvasDims.width * zoomLevel);
  const transformedLat =
    ((1 / Math.max(2, aspectRatio)) * -360 * point.y) /
    (canvasDims.height * zoomLevel);
  return {
    lon: transformedLon,
    lat: transformedLat,
  };
}

export function transformPoint(mapState: MapState, point: Point): Coord {
  const {canvasDims, zoomLevel, centerCoord} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedLon =
    180 +
    (Math.min(2, aspectRatio) * 180 * (point.x - 0.5 * canvasDims.width)) /
      (canvasDims.width * zoomLevel);
  const transformedLat =
    ((1 / Math.max(2, aspectRatio)) *
      -360 *
      (point.y - 0.5 * canvasDims.height)) /
    (canvasDims.height * zoomLevel);
  return {
    lon: transformedLon + lonOffset,
    lat: transformedLat + latOffset,
  };
}

export function minCenterLat(mapState: MapState): number {
  const {canvasDims, zoomLevel} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const botLat =
    ((1 / Math.max(2, aspectRatio)) * -180 * canvasDims.height) /
    (canvasDims.height * zoomLevel);
  return -90 - botLat;
}

export function maxCenterLat(mapState: MapState): number {
  const {canvasDims, zoomLevel} = mapState;
  const aspectRatio = canvasDims.width / canvasDims.height;
  const topLat =
    ((1 / Math.max(2, aspectRatio)) * 180 * canvasDims.height) /
    (canvasDims.height * zoomLevel);
  return 90 - topLat;
}

/**
 * The pixel size of the map at current zoom level if not clipped.
 */
export function globeDims(mapState: MapState): {width: number; height: number} {
  const topRight = scaleCoord(mapState, {lon: 360, lat: 90});
  const bottomLeft = scaleCoord(mapState, {lon: 0, lat: -90});
  return {width: topRight.x - bottomLeft.x, height: topRight.y - bottomLeft.y};
}
