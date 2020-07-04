import React, {useState, useRef, useEffect} from 'react';
import {style} from 'typestyle';

import {MapState, globeDims} from '../../utils/mapState';
import {BackgroundMapGlState, getGlState, render, updateTexture} from './gl';
import {setGlUnavailable} from '../../containers/App/actions';

const canvasStyle = style({
  position: 'fixed',
});

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const defaultGlobeImg = require('../../img/globe-800w.png');
const srcSet = [200, 400, 800, 1600, 2400, 3600, 4800]
  .map(
    (width: number) => `${require(`../../img/globe-${width}w.png`)} ${width}w`,
  )
  .join(', ');

const BackgroundMap = ({mapState}: {mapState: MapState}) => {
  const {zoomLevel, centerCoord} = mapState;
  const canvasRef = useRef<HTMLCanvasElement>();
  const [glState, setGlState] = useState<BackgroundMapGlState>();

  useEffect(() => {
    if (canvasRef.current != null && glState == null) {
      const gl = canvasRef.current.getContext('webgl2');
      if (gl != null) {
        setGlState(getGlState(gl));
      } else {
        setGlUnavailable();
      }
    }
  }, [glState]);

  // Initialize image, and update sizes property if image with
  // has changed. Updating sizes may cause image to reload with
  // an image of a new resolution.
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const globeWidth = globeDims(mapState).width;
  useEffect(() => {
    if (image == null) {
      if (glState != null) {
        const img = new Image();
        img.src = defaultGlobeImg;
        img.srcset = srcSet;
        img.sizes = `${globeWidth}px`;
        img.onload = () => {
          updateTexture(glState, img);
          setImage(img);
        };
      }
    } else {
      image.sizes = `${globeWidth}px`;
    }
  }, [glState, image, globeWidth]);

  const {lon: centerLon, lat: centerLat} = centerCoord;
  useEffect(() => {
    if (glState != null) {
      const requestAnimationFrameId = requestAnimationFrame(() => {
        render(glState, {lon: centerLon, lat: centerLat}, zoomLevel);
      });
      return () => {
        cancelAnimationFrame(requestAnimationFrameId);
      };
    }
    // Include a dependency on `image` so renders happen then the
    // image texture is updated.
  }, [glState, centerLon, centerLat, zoomLevel, image]);

  return (
    <canvas
      className={canvasStyle}
      width={mapState.canvasDims.width}
      height={mapState.canvasDims.height}
      ref={(canvas: HTMLCanvasElement) => {
        canvasRef.current = canvas;
      }}
    />
  );
};

export default BackgroundMap;
