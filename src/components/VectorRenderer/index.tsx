import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VectorFieldBase from '../VectorFieldBase';

interface VectorRendererProps {}
interface VectorRendererState {}
export default class extends VectorFieldBase<
  VectorRendererProps,
  VectorRendererState
> {
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
    for (let x = 0; x < this.props.vectorField.getWidth(); x = x + 5) {
      for (let y = 0; y < this.props.vectorField.getHeight(); y = y + 5) {
        this.plotArrow(
          x,
          y,
          this.props.vectorField.uField[x][y],
          this.props.vectorField.vField[x][y],
        );
      }
    }
    ctx.stroke();

    for (let x = 0; x <= this.props.vectorField.getWidth(); x = x + 5) {
      ctx.moveTo(this.xToComponentX(x), this.yToComponentY(0));
      ctx.lineTo(
        this.xToComponentX(x),
        this.yToComponentY(this.props.vectorField.getHeight() - 1),
      );
    }
    for (let y = 0; y <= this.props.vectorField.getHeight(); y = y + 5) {
      ctx.moveTo(this.xToComponentX(0), this.yToComponentY(y));
      ctx.lineTo(
        this.xToComponentX(this.props.vectorField.getWidth() - 1),
        this.yToComponentY(y),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(x: number, y: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    ctx.translate(this.xToComponentX(x), this.yToComponentY(y));
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
    ctx.restore();
  }

  render() {
    return (
      <div>
        <canvas
          width={this.props.width}
          height={this.props.height}
          ref={(canvas: HTMLCanvasElement) => {
            this.canvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
      </div>
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
