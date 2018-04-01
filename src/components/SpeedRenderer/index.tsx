import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import {
  GLState,
  draw,
  getGLStateForSpeeds,
  setCenterCoord,
  setViewport,
  setZoomLevel,
} from './gl';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;
  maxSpeed = 0;

  getGLState(): GLState {
    if (!this.glState) {
      const gl = this.canvas.getContext('webgl') as WebGLRenderingContext;
      this.glState = getGLStateForSpeeds(gl);
    }
    return this.glState;
  }

  componentDidMount() {
    setViewport(this.getGLState());
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  componentDidUpdate() {
    setViewport(this.getGLState());
    setZoomLevel(this.getGLState(), this.props.projState.zoomLevel);
    setCenterCoord(this.getGLState(), this.props.projState.centerCoord);
    window.requestAnimationFrame(this.updateAndRender.bind(this));
  }

  updateAndRender() {
    const speedData = this.props.vectorField.speedData();
    const maxSpeed = Math.max(...speedData);
    if (maxSpeed > this.maxSpeed) {
      this.maxSpeed = maxSpeed;
    }
    const transformedSpeedData = new Uint8Array(512 * 512);
    // Transform speed data direction, make square power of two, and normalize
    for (let x = 0; x < 512; x++) {
      for (let y = 0; y < 512; y++) {
        transformedSpeedData[512 * y + x] =
          speedData[
            181 * Math.floor(x * 360 / 512) + Math.floor(y * 181 / 512)
          ] /
          (this.maxSpeed / 255);
      }
    }
    draw(this.getGLState(), transformedSpeedData);
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
