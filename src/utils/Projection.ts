import {Point, Coord} from '../Types';

export interface ProjState {
  mapDims: {width: number; height: number};
  zoomLevel: number;
  centerCoord: Coord;
}

export function scaleCoord(projState: ProjState, coord: Coord): Point {
  const {mapDims: screen, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const transformedX =
    ((screen.width * coord.lon) / 180) * (1 / Math.min(2, aspectRatio));
  const transformedY =
    ((-screen.height * coord.lat) / 360) * Math.max(2, aspectRatio);
  const scaledX = transformedX * zoomLevel;
  const scaledY = transformedY * zoomLevel;
  return {
    x: scaledX,
    y: scaledY,
  };
}

export function transformCoord(projState: ProjState, coord: Coord): Point {
  const {mapDims, centerCoord, zoomLevel} = projState;
  const aspectRatio = mapDims.width / mapDims.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedX =
    mapDims.width / 2 -
    ((mapDims.width * (180 - coord.lon + lonOffset)) / 180) *
      (1 / Math.min(2, aspectRatio)) *
      zoomLevel;
  const transformedY =
    mapDims.height / 2 -
    ((mapDims.height * (coord.lat - latOffset)) / 360) *
      Math.max(2, aspectRatio) *
      zoomLevel;
  return {
    x: transformedX,
    y: transformedY,
  };
}

export function scalePoint(projState: ProjState, point: Point): Coord {
  const {mapDims, zoomLevel} = projState;
  const aspectRatio = mapDims.width / mapDims.height;
  const transformedLon =
    (Math.min(2, aspectRatio) * 180 * point.x) / (mapDims.width * zoomLevel);
  const transformedLat =
    ((1 / Math.max(2, aspectRatio)) * -360 * point.y) /
    (mapDims.height * zoomLevel);
  return {
    lon: transformedLon,
    lat: transformedLat,
  };
}

export function transformPoint(projState: ProjState, point: Point): Coord {
  const {mapDims, zoomLevel, centerCoord} = projState;
  const aspectRatio = mapDims.width / mapDims.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedLon =
    180 +
    (Math.min(2, aspectRatio) * 180 * (point.x - 0.5 * mapDims.width)) /
      (mapDims.width * zoomLevel);
  const transformedLat =
    ((1 / Math.max(2, aspectRatio)) * -360 * (point.y - 0.5 * mapDims.height)) /
    (mapDims.height * zoomLevel);
  return {
    lon: transformedLon + lonOffset,
    lat: transformedLat + latOffset,
  };
}

export function minCenterLat(projState: ProjState): number {
  const {mapDims, zoomLevel} = projState;
  const aspectRatio = mapDims.width / mapDims.height;
  const botLat =
    ((1 / Math.max(2, aspectRatio)) * -180 * mapDims.height) /
    (mapDims.height * zoomLevel);
  return -90 - botLat;
}

export function maxCenterLat(projState: ProjState): number {
  const {mapDims, zoomLevel} = projState;
  const aspectRatio = mapDims.width / mapDims.height;
  const topLat =
    ((1 / Math.max(2, aspectRatio)) * 180 * mapDims.height) /
    (mapDims.height * zoomLevel);
  return 90 - topLat;
}
