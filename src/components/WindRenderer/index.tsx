import React from 'react';
import {style} from 'typestyle';

import VectorField from '../../utils/fielddata/VectorField';
import {ProjState} from '../../utils/Projection';
import {
  GlState,
  drawSpeeds,
  drawParticles,
  updateParticles,
  updateWindTex,
  getGLState,
} from './gl';
import {RootAction as Action} from '../../reducers';
import {transformDataForGPU} from './transformData';
import DataTransformer from 'worker-loader!./DataTransformerWorker';

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
export default class WindRenderer extends React.Component<Props, {}> {
  canvas!: HTMLCanvasElement;
  glState: GlState | null = null;
  dataTransformer = new DataTransformer();
  resetParticles = false;

  constructor(props: Props) {
    super(props);
    this.dataTransformer.onmessage = (message: {
      data: {uData: Uint8Array; vData: Uint8Array};
    }): void => {
      if (this.glState != null) {
        updateWindTex(this.glState, message.data.uData, message.data.vData);
      }
    };
  }

  componentDidMount() {
    const gl = this.canvas.getContext('webgl');
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
      window.requestAnimationFrame(this.updateAndRender.bind(this, null));
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

  updateAndRender(prevTime: number | null, timestamp: number) {
    prevTime = prevTime || 0;
    const deltaT = timestamp - prevTime;

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

  render(): JSX.Element {
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
