import {Point, Coord} from '../Types';

export function scaleCoord(coord: Coord): Point {
  return {
    x: coord.lon / 360,
    y: coord.lat / 360,
  };
}

export function transformCoord(coord: Coord): Point {
  return {
    x: coord.lon / 360,
    y: (coord.lat + 90) / 360,
  };
}

export function scalePoint(point: Point): Coord {
  return {
    lon: point.x * 360,
    lat: point.y * 360,
  };
}

export function transformPoint(point: Point): Coord {
  return {
    lon: point.x * 360,
    lat: point.y * 360 - 90,
  };
}

export const maxPoint: Point = {
  x: 1,
  y: 0.5,
};
