import {Point, Coord} from '../Types';
import * as plateCarree from './UnitPlateCarree';

export interface Screen {
  width: number;
  height: number;
}

export function scaleCoord(screen: Screen, coord: Coord): Point {
  let scaleFac;
  if (widthLimited(screen)) {
    scaleFac = screen.width / plateCarree.maxPoint.x;
  } else {
    scaleFac = screen.height / plateCarree.maxPoint.y;
  }
  const unitPoint = plateCarree.scaleCoord(coord);
  return {
    x: unitPoint.x * scaleFac,
    y: -unitPoint.y * scaleFac,
  };
}

export function transformCoord(screen: Screen, coord: Coord): Point {
  const unitPoint = plateCarree.transformCoord(coord);
  if (widthLimited(screen)) {
    const scaleFac = screen.width / plateCarree.maxPoint.x;
    const yOffset = (screen.height - plateCarree.maxPoint.y * scaleFac) / 2;
    return {
      x: unitPoint.x * scaleFac,
      y: (plateCarree.maxPoint.y - unitPoint.y) * scaleFac + yOffset,
    };
  } else {
    const scaleFac = screen.height / plateCarree.maxPoint.y;
    const xOffset = (screen.width - plateCarree.maxPoint.x * scaleFac) / 2;
    return {
      x: unitPoint.x * scaleFac + xOffset,
      y: (plateCarree.maxPoint.y - unitPoint.y) * scaleFac,
    };
  }
}

function widthLimited(screen: Screen) {
  return (
    screen.width / plateCarree.maxPoint.x <
    screen.height / plateCarree.maxPoint.y
  );
}

export function scalePoint(screen: Screen, point: Point): Coord {
  let scaleFac;
  if (widthLimited(screen)) {
    scaleFac = screen.width / plateCarree.maxPoint.x;
  } else {
    scaleFac = screen.height / plateCarree.maxPoint.y;
  }
  return plateCarree.scalePoint({
    x: point.x / scaleFac,
    y: -point.y / scaleFac,
  });
}

export function transformPoint(screen: Screen, point: Point): Coord {
  if (widthLimited(screen)) {
    const scaleFac = screen.width / plateCarree.maxPoint.x;
    const yOffset = (screen.height - plateCarree.maxPoint.y * scaleFac) / 2;
    return plateCarree.transformPoint({
      x: point.x / scaleFac,
      y: plateCarree.maxPoint.y - (point.y - yOffset) / scaleFac,
    });
  } else {
    const scaleFac = screen.height / plateCarree.maxPoint.y;
    const xOffset = (screen.width - plateCarree.maxPoint.x * scaleFac) / 2;
    return plateCarree.transformPoint({
      x: (point.x - xOffset) / scaleFac,
      y: plateCarree.maxPoint.y - point.y / scaleFac,
    });
  }
}
