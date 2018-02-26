import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

const Globe = require('../../img/globe.png');

export default (props: {width: number; height: number; zoom: number}) => {
  let width: number;
  let height: number;
  if (props.width < props.height * 2) {
    // width limited
    width = props.width;
    height = props.width / 2;
  } else {
    // height limited
    width = props.height * 2;
    height = props.height;
  }
  return (
    <div
      id="map"
      className={style({
        width: props.width,
        height: props.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      })}>
      <img
        src={Globe}
        className={style({
          display: 'block',
          width: width * props.zoom,
          height: height * props.zoom,
        })}
      />
    </div>
  );
};
