import React, {useRef, useEffect} from 'react';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord} from '../../utils/Projection';
import mod from '../../utils/mod';

interface VectorRendererProps {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
}
export default function VectorRenderer({
  vectorField,
  projState,
  width,
  height,
}: VectorRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (!ctxRef.current) {
      if (!canvasRef.current) {
        throw new Error('VectorRenderer failed to reference canvas element.');
      }
      ctxRef.current = canvasRef.current.getContext('2d');
      if (!ctxRef.current) {
        throw new Error('VectorRenderer failed to get canvas context.');
      }
    }
    renderOnCanvas(ctxRef.current, width, height, projState, vectorField);
  });

  return (
    <canvas
      id="vector-renderer"
      className={style({
        position: 'fixed',
      })}
      width={width}
      height={height}
      ref={(canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;
      }}
    />
  );
}

function drawArrow(ctx: CanvasRenderingContext2D, len: number) {
  const tail = -5 * len;
  const head = 5 * len;
  const headStart = 5 * len - 5;
  ctx.moveTo(tail, 0);
  ctx.lineTo(headStart, 0);
  ctx.moveTo(head, 0);
  ctx.lineTo(headStart, 1.5);
  ctx.lineTo(headStart, -1.5);
  ctx.lineTo(head, 0);
}

function plotArrow(
  ctx: CanvasRenderingContext2D,
  projState: ProjState,
  lon: number,
  lat: number,
  u: number,
  v: number,
) {
  ctx.save();
  const {x, y} = transformCoord(projState, {lon, lat});
  ctx.translate(x, y);
  ctx.rotate(-Math.atan2(v, u));
  const scaleFactor = Math.abs(
    transformCoord(projState, {lon: 1, lat: 1}).x -
      transformCoord(projState, {lon: 0, lat: 0}).x,
  );
  drawArrow(
    ctx,
    Math.sqrt((u * scaleFactor) ** 2 + (v * scaleFactor) ** 2) / 30,
  );
  ctx.restore();
}

function renderOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  projState: ProjState,
  vectorField: VectorField,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'lightblue';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.globalAlpha = 0.2;

  const leftmostLon = Math.floor((projState.centerCoord.lon - 180) / 10) * 10;
  const rightmostLon = leftmostLon + 370;

  // Draw arrows
  for (let lon = leftmostLon; lon < rightmostLon; lon = lon + 5) {
    for (let lat = -90; lat <= 90; lat = lat + 5) {
      plotArrow(
        ctx,
        projState,
        lon,
        lat,
        vectorField.uField.getValue(mod(lon, 360), lat),
        vectorField.vField.getValue(mod(lon, 360), lat),
      );
    }
  }
  ctx.stroke();

  // Add vertical grid lines
  for (let lon = leftmostLon; lon < rightmostLon; lon = lon + 10) {
    const start = transformCoord(projState, {lon, lat: 90});
    ctx.moveTo(start.x, start.y);
    const end = transformCoord(projState, {lon, lat: -90});
    ctx.lineTo(end.x, end.y);
  }

  // Add horizontal grid lines
  for (
    let lat = vectorField.getMinLat();
    lat <= vectorField.getMaxLat();
    lat = lat + 10
  ) {
    const y = transformCoord(projState, {lon: 0, lat}).y;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }

  // Draw grid lines
  ctx.stroke();
}
