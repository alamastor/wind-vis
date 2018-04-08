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
import {RootAction as Action} from '../../reducers';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
  setGlUnavailable: () => Action;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;
  maxSpeed = 0;

  componentDidMount() {
    const gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');
    if (gl != null) {
      this.glState = getGLStateForSpeeds(gl);
      setViewport(this.glState);
      setZoomLevel(this.glState, this.props.projState.zoomLevel);
      setCenterCoord(this.glState, this.props.projState.centerCoord);
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    } else {
      this.props.setGlUnavailable();
    }
  }

  componentDidUpdate() {
    if (this.glState != null) {
      setViewport(this.glState);
      setZoomLevel(this.glState, this.props.projState.zoomLevel);
      setCenterCoord(this.glState, this.props.projState.centerCoord);
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    }
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
    if (this.glState != null) {
      draw(this.glState, transformedSpeedData);
    }
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
