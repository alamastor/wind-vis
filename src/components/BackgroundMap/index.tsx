import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

const Globe = require('../../img/globe.png');

const BackgroundMap = (props: {
  width: number;
  height: number;
  zoom: number;
  centerLat: number;
  centerLon: number;
}) => {
  let width: number;
  let height: number;
  if (props.width < props.height * 2) {
    // width limited
    width = props.zoom * props.width;
    height = props.zoom * props.width / 2;
  } else {
    // height limited
    width = props.zoom * props.height * 2;
    height = props.zoom * props.height;
  }
  const midX = width * props.centerLon / 360; // Assume full globe map
  const midY = height * (props.centerLat + 90) / 180; // Assume full globe map
  const xOffset = width / 2 - midX + (props.width - width) / 2;
  const yOffset = midY - height / 2 + (props.height - height) / 2;
  return (
    <div
      id="map"
      className={style({
        width: props.width,
        height: props.height,
        overflow: 'hidden',
        display: 'block',
      })}>
      <img
        src={Globe}
        className={style({
          position: 'relative',
          top: yOffset,
          left: xOffset,
          width: width,
          height: height,
          pointerEvents: 'none',
        })}
      />
    </div>
  );
};

export default BackgroundMap;
