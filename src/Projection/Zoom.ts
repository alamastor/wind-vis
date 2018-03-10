import {Point, Coord} from '../Types';
import * as screenProj from './Screen';

export interface State {
  screen: screenProj.Screen;
  zoomLevel: number;
}

export function scaleCoord(projState: State, coord: Coord): Point {
  const {screen, zoomLevel} = projState;
  const screenTransformed = screenProj.scaleCoord(screen, coord);
  return {
    x: screenTransformed.x * zoomLevel,
    y: screenTransformed.y * zoomLevel,
  };
}

export function transformCoord(projState: State, coord: Coord): Point {
  const {screen, zoomLevel} = projState;
  const screenTransformed = screenProj.transformCoord(screen, coord);
  return {
    x: screen.width / 2 * (1 - zoomLevel) + screenTransformed.x * zoomLevel,
    y: screen.height / 2 * (1 - zoomLevel) + screenTransformed.y * zoomLevel,
  };
}

export function scalePoint(projState: State, point: Point): Coord {
  return screenProj.scalePoint(projState.screen, {
    x: point.x / projState.zoomLevel,
    y: point.y / projState.zoomLevel,
  });
}

export function transformPoint(projState: State, point: Point): Coord {
  const {screen, zoomLevel} = projState;
  return screenProj.transformPoint(screen, {
    x: (point.x - screen.width / 2 * (1 - zoomLevel)) / zoomLevel,
    y: (point.y - screen.height / 2 * (1 - zoomLevel)) / zoomLevel,
  });
}
