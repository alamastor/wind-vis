import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {
  State as ProjState,
  transformCoord,
  scaleCoord,
} from '../../Projection/Translate';

const defaultGlobeImg = require(`../../img/globe-800w.png`);
const srcSet = [200, 400, 800, 1600, 2400, 3600, 4800]
  .map(
    (width: number) => `${require(`../../img/globe-${width}w.png`)} ${width}w`,
  )
  .join(', ');

const BackgroundMap = (props: {projState: ProjState}) => {
  const topLeft = transformCoord(props.projState, {lon: 0, lat: 90});
  const bottomRight = transformCoord(props.projState, {lon: 360, lat: -90});
  const dimensions = scaleCoord(props.projState, {lon: 360, lat: 180});
  const width = Math.abs(dimensions.x);
  const height = Math.abs(dimensions.y);
  return (
    <div
      id="map"
      className={style({
        width: props.projState.screen.width,
        height: props.projState.screen.height,
        overflow: 'hidden',
        position: 'relative',
        display: 'block',
        pointerEvents: 'none',
      })}>
      <img
        src={defaultGlobeImg}
        srcSet={srcSet}
        sizes={`${Math.round(width)}px`}
        className={style({
          position: 'absolute',
          left: topLeft.x,
          top: topLeft.y,
          width: width,
          height: height,
          pointerEvents: 'none',
        })}
      />
      <img
        src={defaultGlobeImg}
        srcSet={srcSet}
        sizes={`${Math.round(width)}px`}
        className={style({
          position: 'absolute',
          left: topLeft.x - width,
          top: topLeft.y,
          width: width,
          height: height,
          pointerEvents: 'none',
        })}
      />
    </div>
  );
};

export default BackgroundMap;
