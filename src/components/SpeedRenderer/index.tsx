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
const DataTransformer = require('worker-loader!./DataTransformer');

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  maxSpeed: number;
  width: number;
  height: number;
  setGlUnavailable: () => Action;
}
interface State {}
export default class SpeedRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: GLState | null = null;
  dataTransformer = new DataTransformer();

  constructor(props: Props) {
    super(props);
    this.dataTransformer.onmessage = (message: {
      data: {transformedSpeedData: Uint8Array};
    }) => {
      if (this.glState != null) {
        draw(this.glState, message.data.transformedSpeedData);
      }
    };
  }

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

  componentDidUpdate(prevProps: Props) {
    if (this.glState != null) {
      setViewport(this.glState);
      setZoomLevel(this.glState, this.props.projState.zoomLevel);
      setCenterCoord(this.glState, this.props.projState.centerCoord);
      if (prevProps.vectorField !== this.props.vectorField) {
        window.requestAnimationFrame(this.updateAndRender.bind(this));
      }
    }
  }

  updateAndRender() {
    this.dataTransformer.postMessage({
      speedData: this.props.vectorField.speedData(),
      maxSpeed: this.props.maxSpeed,
    });
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
