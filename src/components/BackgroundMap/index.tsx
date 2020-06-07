import * as React from 'react';
import {style} from 'typestyle';

import {ProjState, transformCoord, scaleCoord} from '../../utils/Projection';
import mod from '../../utils/mod';

const mainStyle = style({
  overflow: 'hidden',
  position: 'relative',
  display: 'block',
  pointerEvents: 'none',
});
const imgStyle = style({
  position: 'absolute',
  pointerEvents: 'none',
});

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const defaultGlobeImg = require('../../img/globe-800w.png');
const srcSet = [200, 400, 800, 1600, 2400, 3600, 4800]
  .map(
    (width: number) => `${require(`../../img/globe-${width}w.png`)} ${width}w`,
  )
  .join(', ');

const BackgroundMap = (props: {projState: ProjState}) => {
  const topLeft = transformCoord(props.projState, {lon: 0, lat: 90});
  const dimensions = scaleCoord(props.projState, {lon: 360, lat: 180});
  const width = Math.abs(dimensions.x);
  const height = Math.abs(dimensions.y);
  return (
    <div
      id="map"
      className={mainStyle}
      style={{
        width: props.projState.mapDims.width,
        height: props.projState.mapDims.height,
      }}
    >
      <img
        src={defaultGlobeImg}
        srcSet={srcSet}
        sizes={`${Math.round(width)}px`}
        className={imgStyle}
        style={{
          left: mod(topLeft.x, width),
          top: topLeft.y,
          width: width,
          height: height,
        }}
      />
      <img
        src={defaultGlobeImg}
        srcSet={srcSet}
        sizes={`${Math.round(width)}px`}
        className={imgStyle}
        style={{
          left: mod(topLeft.x, width) - width,
          top: topLeft.y,
          width: width,
          height: height,
        }}
      />
    </div>
  );
};

export default BackgroundMap;
