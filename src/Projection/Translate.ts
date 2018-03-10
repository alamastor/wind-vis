import {Point, Coord} from '../Types';
import * as screenProj from './Screen';
import * as zoomProj from './Zoom';

export interface State {
  screen: screenProj.Screen;
  zoomLevel: number;
  centerCoord: Coord;
}

export function scaleCoord(projState: State, coord: Coord): Point {
  const {screen, zoomLevel, centerCoord} = projState;
  return zoomProj.scaleCoord({screen, zoomLevel}, coord);
}

export function transformCoord(projState: State, coord: Coord): Point {
  const {screen, zoomLevel, centerCoord} = projState;
  const centerPoint = zoomProj.transformCoord({screen, zoomLevel}, centerCoord);
  const zoomTransformed = zoomProj.transformCoord({screen, zoomLevel}, coord);
  return {
    x: zoomTransformed.x + (screen.width / 2 - centerPoint.x),
    y: zoomTransformed.y + (screen.height / 2 - centerPoint.y),
  };
}

export function scalePoint(projState: State, point: Point): Coord {
  const {screen, zoomLevel, centerCoord} = projState;
  return zoomProj.scalePoint({screen, zoomLevel}, point);
}

export function transformPoint(projState: State, point: Point): Coord {
  const {screen, zoomLevel, centerCoord} = projState;
  const centerPoint = zoomProj.transformCoord({screen, zoomLevel}, centerCoord);
  return zoomProj.transformPoint(
    {screen, zoomLevel},
    {
      x: point.x - (screen.width / 2 - centerPoint.x),
      y: point.y - (screen.height / 2 - centerPoint.y),
    },
  );
}

export function maxCenterLat(projState: State): number {
  const {screen, zoomLevel, centerCoord} = projState;
  const projTop = zoomProj.transformCoord(
    {screen, zoomLevel},
    {lon: 0, lat: 90},
  ).y;
  const heightOffScreen = -projTop;
  return -zoomProj.scalePoint(
    {screen, zoomLevel},
    {x: 0, y: Math.max(0, heightOffScreen)},
  ).lat;
}

export function minCenterLat(projState: State): number {
  const {screen, zoomLevel, centerCoord} = projState;
  const projBott = zoomProj.transformCoord(
    {screen, zoomLevel},
    {lon: 0, lat: -90},
  ).y;
  const heightOffScreen = projBott - screen.height;
  return zoomProj.scalePoint(
    {screen, zoomLevel},
    {x: 0, y: Math.max(0, heightOffScreen)},
  ).lat;
}
