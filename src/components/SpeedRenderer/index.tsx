import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
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

    const rectDim = scaleCoord(this.props.projState, {
      lon: 1,
      lat: 1,
    });
    for (let lon = 0; lon < 360; lon++) {
      for (let lat = 90; lat > -90; lat--) {
        const rectPoint = transformCoord(this.props.projState, {
          lon: lon,
          lat: lat,
        });
        const u = this.props.vectorField.uField.getValue(lon, lat);
        const v = this.props.vectorField.vField.getValue(lon, lat);
        const spd = Math.sqrt(u ** 2 + v ** 2);
        const alpha = spd / 20;

        this.drawVal(ctx, rectPoint, rectDim, alpha);
      }
    }
  }

  drawVal(
    ctx: CanvasRenderingContext2D,
    point: {x: number; y: number},
    size: {x: number; y: number},
    alpha: number,
  ) {
    ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    ctx.fillRect(point.x - size.x / 2, point.y - size.y / 2, size.x, size.y);
  }

  render() {
    return (
      <canvas
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
