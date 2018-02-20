import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VectorFieldBase from '../VectorFieldBase';

interface VectorRendererProps {}
interface VectorRendererState {}
export default class extends VectorFieldBase<
  VectorRendererProps,
  VectorRendererState
> {
  componentDidMount() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.renderOnCanvas();
  }

  componentDidUpdate() {
    this.renderOnCanvas();
  }

  renderOnCanvas() {
    const ctx = this.getCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
      ctx.moveTo(this.xToCanvasX(x), this.yToCanvasY(0));
      ctx.lineTo(
        this.xToCanvasX(x),
        this.yToCanvasY(this.props.vectorField.getHeight() - 1),
      );
    }
    for (let y = 0; y <= this.props.vectorField.getHeight(); y = y + 5) {
      ctx.moveTo(this.xToCanvasX(0), this.yToCanvasY(y));
      ctx.lineTo(
        this.xToCanvasX(this.props.vectorField.getWidth() - 1),
        this.yToCanvasY(y),
      );
    }
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  plotArrow(x: number, y: number, u: number, v: number) {
    const ctx = this.getCtx();
    ctx.save();
    ctx.translate(this.xToCanvasX(x), this.yToCanvasY(y));
    ctx.rotate(-Math.atan2(v, u));
    drawArrow(ctx, Math.sqrt(u ** 2 + v ** 2) / 10);
    ctx.restore();
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
