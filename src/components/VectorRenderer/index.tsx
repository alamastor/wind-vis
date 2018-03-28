import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord} from '../../utils/Projection';
import mod from '../../utils/mod';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
}
interface State {}
export default class VectorRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;

  getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    return this.ctx;
  }

  componentDidMount() {
    this.renderOnCanvas();
  }

  componentDidUpdate() {
    this.renderOnCanvas();
  }

  renderOnCanvas() {
    const ctx = this.getCtx();
    ctx.clearRect(0, 0, this.props.width, this.props.height);
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.globalAlpha = 0.2;

    const leftmostLon =
      Math.floor((this.props.projState.centerCoord.lon - 180) / 10) * 10;
    const rightmostLon = leftmostLon + 370;

    // Draw arrows
    for (let lon = leftmostLon; lon < rightmostLon; lon = lon + 5) {
      for (let lat = -90; lat <= 90; lat = lat + 5) {
        this.plotArrow(
          lon,
          lat,
          this.props.vectorField.uField.getValue(mod(lon, 360), lat),
          this.props.vectorField.vField.getValue(mod(lon, 360), lat),
        );
      }
    }
    ctx.stroke();

    // Add vertical gridlines
    for (let lon = leftmostLon; lon < rightmostLon; lon = lon + 10) {
      const start = transformCoord(this.props.projState, {lon, lat: 90});
      ctx.moveTo(start.x, start.y);
      const end = transformCoord(this.props.projState, {lon, lat: -90});
      ctx.lineTo(end.x, end.y);
    }

    // Add horizontal gridlines
    for (
      let lat = this.props.vectorField.getMinLat();
      lat <= this.props.vectorField.getMaxLat();
      lat = lat + 10
    ) {
      const y = transformCoord(this.props.projState, {lon: 0, lat}).y;
      ctx.moveTo(0, y);
      ctx.lineTo(this.props.width, y);
    }

    // Draw gridlines
    ctx.stroke();
  }

  plotArrow(lon: number, lat: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    let {x, y} = transformCoord(this.props.projState, {lon, lat});
    ctx.translate(x, y);
    ctx.rotate(-Math.atan2(v, u));
    const scaleFactor = Math.abs(
      transformCoord(this.props.projState, {lon: 1, lat: 1}).x -
        transformCoord(this.props.projState, {lon: 0, lat: 0}).x,
    );
    drawArrow(
      ctx,
      Math.sqrt((u * scaleFactor) ** 2 + (v * scaleFactor) ** 2) / 30,
    );
    ctx.restore();
  }

  render() {
    return (
      <canvas
        id="vector-renderer"
        className={style({
          position: 'fixed',
        })}
        width={this.props.width}
        height={this.props.height}
        ref={(canvas: HTMLCanvasElement) => {
          this.canvas = canvas;
        }}
      />
    );
  }
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
