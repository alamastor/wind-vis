import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../fields';

interface Props {
  vectorField: VectorField;
  height: number;
  width: number;
}
interface State {}

export default abstract class<P, S> extends React.Component<
  Props & P,
  State & S
> {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;

  componentDidMount() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
  }

  getCtx(): CanvasRenderingContext2D {
    if (!this.ctx) {
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
    return this.ctx;
  }

  xUnitsToCanvasXUnits(xUnits: number) {
    return xUnits * (this.props.width / this.props.vectorField.getWidth());
  }

  xToCanvasX(x: number) {
    return this.xUnitsToCanvasXUnits(x);
  }

  yUnitsToCanvasYUnits(yUnits: number) {
    return (
      yUnits * (this.props.height / (this.props.vectorField.getHeight() - 1))
    );
  }

  yToCanvasY(y: number) {
    return this.getCtx().canvas.height - this.yUnitsToCanvasYUnits(y);
  }

  render() {
    return (
      <div>
        <canvas
          ref={(canvas: HTMLCanvasElement) => {
            this.canvas = canvas;
          }}
          style={{position: 'fixed'}}
        />
      </div>
    );
  }
}
