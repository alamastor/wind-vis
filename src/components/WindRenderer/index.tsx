import React, {useRef, useEffect} from 'react';
import {style} from 'typestyle';

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
import DataTransformer from 'worker-loader!./DataTransformerWorker';
import {WindData} from '../../../rust_pkg';

interface WindRendererProps {
  windData: WindData;
  tau: number;
  projState: ProjState;
  width: number;
  height: number;
  resetParticlesOnInit: boolean;
  frameRate: number;
  displayParticles: boolean;
  setGlUnavailable: () => Action;
}
export default function WindRenderer({
  windData,
  tau,
  projState,
  width,
  height,
  resetParticlesOnInit,
  displayParticles,
  setGlUnavailable,
}: WindRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>();
  const glStateRef = useRef<GlState | null>(null);
  const resetParticlesRef = useRef(false);
  const projStateRef = useRef(projState);
  projStateRef.current = projState;
  const displayParticlesRef = useRef(displayParticles);
  displayParticlesRef.current = displayParticles;

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
        window.requestAnimationFrame(updateAndRender.bind(undefined, null));
      } else {
        setGlUnavailable();
      }
    }
  }, [setGlUnavailable, windData, tau]);
  useEffect(() => {
    if (glStateRef.current != null) {
      updateWindTex(
        glStateRef.current,
        windData.u_data_for_gpu(tau),
        windData.v_data_for_gpu(tau),
      );
      if (resetParticlesOnInit) {
        resetParticlesRef.current = true;
      }
    }
  }, [windData, tau, resetParticlesOnInit]);

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
