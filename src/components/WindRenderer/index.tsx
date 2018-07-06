import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import {
  glState,
  drawSpeeds,
  drawParticles,
  updateParticles,
  updateWindTex,
  getGLState,
} from './gl';
import {RootAction as Action} from '../../reducers';
import {transformDataForGPU} from './transformData';
const DataTransformer = require('worker-loader!./DataTransformerWorker');


interface Props {
  vectorField: VectorField;
  projState: ProjState;
  maxSpeed: number;
  width: number;
  height: number;
  resetParticlesOnInit: boolean;
  frameRate: number;
  displayParticles: boolean;
  setGlUnavailable: () => Action;
}
interface State {}
export default class WindRenderer extends React.Component<Props, State> {
  canvas!: HTMLCanvasElement;
  glState: glState | null = null;
  dataTransformer = new DataTransformer();
  resetParticles: boolean = false;

  constructor(props: Props) {
    super(props);
    this.dataTransformer.onmessage = (message: {
      data: {uData: Uint8Array; vData: Uint8Array};
    }) => {
      if (this.glState != null) {
        updateWindTex(this.glState, message.data.uData, message.data.vData);
      }
    };
  }

  componentDidMount() {
    const gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');
    if (gl != null) {
      this.glState = getGLState(gl);
      updateWindTex(
        this.glState,
        transformDataForGPU(
          this.props.vectorField.uField.data,
          this.props.maxSpeed,
        ),
        transformDataForGPU(
          this.props.vectorField.vField.data,
          this.props.maxSpeed,
        ),
      );
      window.requestAnimationFrame(this.updateAndRender.bind(this));
    } else {
      this.props.setGlUnavailable();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.vectorField !== this.props.vectorField &&
      this.glState != null
    ) {
      this.dataTransformer.postMessage({
        uData: this.props.vectorField.uField.data,
        vData: this.props.vectorField.vField.data,
        maxValue: this.props.maxSpeed,
      });
      if (this.props.resetParticlesOnInit) {
        this.resetParticles = true;
      }
    }
  }

  updateAndRender(prevTime: number, timestamp: number) {
    let deltaT: number;
    if (timestamp != null) {
      deltaT = timestamp - prevTime;
    } else {
      deltaT = 0;
      timestamp = prevTime;
    }

    if (this.glState != null) {
      drawSpeeds(
        this.glState,
        this.props.projState.centerCoord,
        this.props.projState.zoomLevel,
      );
      if (this.props.displayParticles) {
        drawParticles(
          this.glState,
          this.props.projState.centerCoord,
          this.props.projState.zoomLevel,
        );
        updateParticles(this.glState, deltaT, this.resetParticles);
      }
      this.resetParticles = false;
    }

    window.requestAnimationFrame(this.updateAndRender.bind(this, timestamp));
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
