import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

const Globe = require('../../img/globe.png');

export default (props: {
  width: number;
  height: number;
  zoom: number;
  midLat: number;
  midLon: number;
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
          top: (props.height - height) / 2,
          left: (props.width - width) / 2,
          width: width,
          height: height,
        })}
      />
    </div>
  );
};
