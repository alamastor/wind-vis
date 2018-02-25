import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {VectorField} from '../../fields';
import Projection from '../../Projection';

const className = style({position: 'fixed'});

interface Props {
  vectorField: VectorField;
  width: number;
  height: number;
}
interface State {}
export default class extends React.Component<Props, State> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  proj: Projection;

  constructor(props: Props) {
    super(props);
    this.proj = new Projection(
      props.vectorField.getMinLat(),
      props.vectorField.getMaxLat(),
      props.vectorField.getMinLon(),
      props.vectorField.getMaxLon(),
      props.width,
      props.height,
    );
  }

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
        this.proj.transformLon(lon),
        this.proj.transformLat(this.props.vectorField.getMinLat()),
      );
      ctx.lineTo(
        this.proj.transformLon(lon),
        this.proj.transformLat(this.props.vectorField.getMaxLat()),
      );
    }

    for (
      let lat = this.props.vectorField.getMinLat();
      lat <= this.props.vectorField.getMaxLat();
      lat = lat + 10
    ) {
      ctx.moveTo(
        this.proj.transformLon(this.props.vectorField.getMinLon()),
        this.proj.transformLat(lat),
      );
      ctx.lineTo(
        this.proj.transformLon(this.props.vectorField.getMaxLon()),
        this.proj.transformLat(lat),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(lat: number, lon: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    ctx.translate(this.proj.transformLon(lon), this.proj.transformLat(lat));
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
    ctx.restore();
  }

  render() {
    return (
      <canvas
        id="vector-renderer"
        className={className}
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
