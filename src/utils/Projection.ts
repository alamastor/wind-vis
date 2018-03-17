import {Point, Coord} from '../Types';

export interface ProjState {
  screen: {width: number; height: number};
  zoomLevel: number;
  centerCoord: Coord;
}

export function scaleCoord(projState: ProjState, coord: Coord): Point {
  const {screen, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const transformedX =
    screen.width * coord.lon / 180 * (1 / Math.min(2, aspectRatio));
  const transformedY =
    -screen.height * coord.lat / 360 * Math.max(2, aspectRatio);
  const scaledX = transformedX * zoomLevel;
  const scaledY = transformedY * zoomLevel;
  return {
    x: scaledX,
    y: scaledY,
  };
}

export function transformCoord(projState: ProjState, coord: Coord): Point {
  const {screen, centerCoord, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedX =
    screen.width / 2 -
    screen.width *
      (180 - coord.lon + lonOffset) /
      180 *
      (1 / Math.min(2, aspectRatio)) *
      zoomLevel;
  const transformedY =
    screen.height / 2 -
    screen.height *
      (coord.lat - latOffset) /
      360 *
      Math.max(2, aspectRatio) *
      zoomLevel;
  return {
    x: transformedX,
    y: transformedY,
  };
}

export function scalePoint(projState: ProjState, point: Point): Coord {
  const {screen, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const transformedLon =
    Math.min(2, aspectRatio) * 180 * point.x / (screen.width * zoomLevel);
  const transformedLat =
    1 / Math.max(2, aspectRatio) * -360 * point.y / (screen.height * zoomLevel);
  return {
    lon: transformedLon,
    lat: transformedLat,
  };
}

export function transformPoint(projState: ProjState, point: Point): Coord {
  const {screen, zoomLevel, centerCoord} = projState;
  const aspectRatio = screen.width / screen.height;
  const lonOffset = centerCoord.lon - 180;
  const latOffset = centerCoord.lat;
  const transformedLon =
    180 +
    Math.min(2, aspectRatio) *
      180 *
      (point.x - 0.5 * screen.width) /
      (screen.width * zoomLevel);
  const transformedLat =
    1 /
    Math.max(2, aspectRatio) *
    -360 *
    (point.y - 0.5 * screen.height) /
    (screen.height * zoomLevel);
  return {
    lon: transformedLon + lonOffset,
    lat: transformedLat + latOffset,
  };
}

export function minCenterLat(projState: ProjState): number {
  const {screen, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const botLat =
    1 /
    Math.max(2, aspectRatio) *
    -180 *
    screen.height /
    (screen.height * zoomLevel);
  return -90 - botLat;
}

export function maxCenterLat(projState: ProjState): number {
  const {screen, zoomLevel} = projState;
  const aspectRatio = screen.width / screen.height;
  const topLat =
    1 /
    Math.max(2, aspectRatio) *
    180 *
    screen.height /
    (screen.height * zoomLevel);
  return 90 - topLat;
}
