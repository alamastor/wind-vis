import React, {useRef, useEffect} from 'react';
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
export default function WindRenderer(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const glStateRef = useRef<GlState | null>(null);
  const dataTransformerRef = useRef<DataTransformer>();
  const resetParticlesRef = useRef(false);
  const projStateRef = useRef(props.projState);
  projStateRef.current = props.projState;

  const updateAndRender = (prevTime: number | null, timestamp: number) => {
    prevTime = prevTime || 0;
    const deltaT = timestamp - prevTime;

    if (glStateRef.current != null) {
      drawSpeeds(
        glStateRef.current,
        projStateRef.current.centerCoord,
        projStateRef.current.zoomLevel,
      );
      if (props.displayParticles) {
        drawParticles(
          glStateRef.current,
          projStateRef.current.centerCoord,
          projStateRef.current.zoomLevel,
        );
        updateParticles(glStateRef.current, deltaT, resetParticlesRef.current);
      }
      resetParticlesRef.current = false;
    }
    window.requestAnimationFrame(updateAndRender.bind(undefined, timestamp));
  };

  useEffect(() => {
    dataTransformerRef.current = new DataTransformer();
    dataTransformerRef.current.onmessage = (message: {
      data: {uData: Uint8Array; vData: Uint8Array};
    }): void => {
      if (glStateRef.current != null) {
        updateWindTex(
          glStateRef.current,
          message.data.uData,
          message.data.vData,
        );
      }
    };

    if (canvasRef.current != null) {
      const gl = canvasRef.current.getContext('webgl');
      if (gl != null) {
        glStateRef.current = getGLState(gl);
        updateWindTex(
          glStateRef.current,
          transformDataForGPU(props.vectorField.uField.data, props.maxSpeed),
          transformDataForGPU(props.vectorField.vField.data, props.maxSpeed),
        );
        window.requestAnimationFrame(updateAndRender.bind(undefined, null));
      } else {
        props.setGlUnavailable();
      }
    }
  }, []);

  useEffect(() => {
    if (glStateRef.current != null && dataTransformerRef.current != null) {
      dataTransformerRef.current.postMessage({
        uData: props.vectorField.uField.data,
        vData: props.vectorField.vField.data,
        maxValue: props.maxSpeed,
      });
      if (props.resetParticlesOnInit) {
        resetParticlesRef.current = true;
      }
    }
  });

  return (
    <canvas
      className={style({
        position: 'fixed',
      })}
      width={props.width}
      height={props.height}
      ref={(canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;
      }}
    />
  );
}
