import React, {useEffect, useRef} from 'react';
import {style} from 'typestyle';
import DataTransformer from 'worker-loader!./DataTransformerWorker';
import {RootAction as Action} from '../../reducers';
import VectorField from '../../utils/fielddata/VectorField';
import {MapState} from '../../utils/mapState';
import {getGLState, GlState, updateWindTextures} from './gl/index';
import {drawParticles, updateParticles} from './gl/particles';
import {drawSpeeds} from './gl/speeds';
import {transformDataForGPU} from './transformData';

const canvasStyle = style({
  position: 'fixed',
});

interface WindRendererProps {
  vectorField: VectorField;
  mapState: MapState;
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
  mapState,
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
  const projStateRef = useRef(mapState);
  projStateRef.current = mapState;
  const displayParticlesRef = useRef(displayParticles);
  displayParticlesRef.current = displayParticles;

  // Set up wind texture rendering
  useEffect(() => {
    dataTransformerRef.current = new DataTransformer();
    dataTransformerRef.current.onmessage = (message: {
      data: {uData: Uint8Array; vData: Uint8Array};
    }): void => {
      if (glStateRef.current != null) {
        updateWindTextures(
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
          glStateRef.current.speedState,
          projStateRef.current.centerCoord,
          projStateRef.current.zoomLevel,
        );
        if (displayParticlesRef.current) {
          updateParticles(
            glStateRef.current.particleState,
            deltaT,
            resetParticlesRef.current,
          );
          drawParticles(
            glStateRef.current.particleState,
            projStateRef.current.centerCoord,
            projStateRef.current.zoomLevel,
          );
        }
        resetParticlesRef.current = false;
      }
      window.requestAnimationFrame(updateAndRender.bind(undefined, timestamp));
    };

    if (glStateRef.current == null && canvasRef.current != null) {
      const gl = canvasRef.current.getContext('webgl2');
      if (gl != null) {
        glStateRef.current = getGLState(gl);
        updateWindTextures(
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
      className={canvasStyle}
      width={width}
      height={height}
      ref={(canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;
      }}
    />
  );
}
