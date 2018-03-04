import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import Projection from '../../Projection';

interface Props {
  vectorField: VectorField;
  projection: Projection;
  width: number;
  height: number;
}
interface State {}
export default class VectorRenderer extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;

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

    ctx.beginPath();
    const color = 'rgb(140, 200, 300)';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    for (
      let lon = this.props.vectorField.getMinLon();
      lon <= this.props.vectorField.getMaxLon();
      lon = lon + 5
    ) {
      for (
        let lat = this.props.vectorField.getMinLat();
        lat <= this.props.vectorField.getMaxLat();
        lat = lat + 5
      ) {
        this.plotArrow(
          lat,
          lon,
          this.props.vectorField.uField.getValue(lat, lon),
          this.props.vectorField.vField.getValue(lat, lon),
        );
      }
    }
    ctx.stroke();

    for (
      let lon = this.props.vectorField.getMinLon();
      lon <= this.props.vectorField.getMaxLon();
      lon = lon + 10
    ) {
      ctx.moveTo(
        this.props.projection.transformLon(lon),
        this.props.projection.transformLat(this.props.vectorField.getMinLat()),
      );
      ctx.lineTo(
        this.props.projection.transformLon(lon),
        this.props.projection.transformLat(this.props.vectorField.getMaxLat()),
      );
    }

    for (
      let lat = this.props.vectorField.getMinLat();
      lat <= this.props.vectorField.getMaxLat();
      lat = lat + 10
    ) {
      ctx.moveTo(
        this.props.projection.transformLon(this.props.vectorField.getMinLon()),
        this.props.projection.transformLat(lat),
      );
      ctx.lineTo(
        this.props.projection.transformLon(this.props.vectorField.getMaxLon()),
        this.props.projection.transformLat(lat),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(lat: number, lon: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    ctx.translate(
      this.props.projection.transformLon(lon),
      this.props.projection.transformLat(lat),
    );
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
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
