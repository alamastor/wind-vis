import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

import {
  State as ProjState,
  transformCoord,
  scaleCoord,
} from '../../Projection/Translate';

const Globe = require('../../img/globe-large.png');

const BackgroundMap = (props: {projState: ProjState}) => {
  const topLeft = transformCoord(props.projState, {lon: 0, lat: 90});
  const bottomRight = transformCoord(props.projState, {lon: 360, lat: -90});
  const dimensions = scaleCoord(props.projState, {lon: 361, lat: 180});
  const width = Math.abs(dimensions.x);
  const height = Math.abs(dimensions.y);
  return (
    <div
      id="map"
      className={style({
        width: props.projState.screen.width,
        height: props.projState.screen.height,
        overflow: 'hidden',
        display: 'block',
      })}>
      <img
        src={Globe}
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
        src={Globe}
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
