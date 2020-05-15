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

interface WindRendererProps {
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
export default function WindRenderer({
  vectorField,
  projState,
  maxSpeed,
  width,
  height,
  resetParticlesOnInit,
  displayParticles,
  setGlUnavailable,
}: WindRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const glStateRef = useRef<GlState | null>(null);
  const dataTransformerRef = useRef<DataTransformer>();
  const resetParticlesRef = useRef(false);
  const projStateRef = useRef(projState);
  projStateRef.current = projState;
  const displayParticlesRef = useRef(displayParticles);
  displayParticlesRef.current = displayParticles;

  // Set up wind texture rendering
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
  }, []);

  useEffect(() => {
    const updateAndRender = (prevTime: number | null, timestamp: number) => {
      prevTime = prevTime || 0;
      const deltaT = timestamp - prevTime;

      if (glStateRef.current != null) {
        drawSpeeds(
          glStateRef.current,
          projStateRef.current.centerCoord,
          projStateRef.current.zoomLevel,
        );
        if (displayParticlesRef.current) {
          drawParticles(
            glStateRef.current,
            projStateRef.current.centerCoord,
            projStateRef.current.zoomLevel,
          );
          updateParticles(
            glStateRef.current,
            deltaT,
            resetParticlesRef.current,
          );
        }
        resetParticlesRef.current = false;
      }
      window.requestAnimationFrame(updateAndRender.bind(undefined, timestamp));
    };

    if (glStateRef.current == null && canvasRef.current != null) {
      const gl = canvasRef.current.getContext('webgl');
      if (gl != null) {
        glStateRef.current = getGLState(gl);
        updateWindTex(
          glStateRef.current,
          transformDataForGPU(vectorField.uField.data, maxSpeed),
          transformDataForGPU(vectorField.vField.data, maxSpeed),
        );
        window.requestAnimationFrame(updateAndRender.bind(undefined, null));
      } else {
        setGlUnavailable();
      }
    }
  }, [
    setGlUnavailable,
    maxSpeed,
    vectorField.uField.data,
    vectorField.vField.data,
  ]);

  useEffect(() => {
    if (glStateRef.current != null && dataTransformerRef.current != null) {
      dataTransformerRef.current.postMessage({
        uData: vectorField.uField.data,
        vData: vectorField.vField.data,
        maxValue: maxSpeed,
      });
      if (resetParticlesOnInit) {
        resetParticlesRef.current = true;
      }
    }
  });

  return (
    <canvas
      className={style({
        position: 'fixed',
      })}
      width={width}
      height={height}
      ref={(canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;
      }}
    />
  );
}
