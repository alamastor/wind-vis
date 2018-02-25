import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {style} from 'typestyle';

const Globe = require('../../img/globe.png');

export default (props: {width: number; height: number}) => {
  let className: string;
  if (props.width < props.height * 2) {
    // width limited
    className = style({
      width: props.width,
      height: props.width / 2,
      margin: `${(props.height - props.width / 2) / 2}px 0 ${(props.height -
        props.width / 2) /
        2}px 0`,
    });
  } else {
    // height limited
    className = style({
      width: props.height * 2,
      height: props.height,
      margin: `0 ${(props.width - props.height * 2) / 2}px 0 ${(props.width -
        props.height * 2) /
        2}px `,
    });
  }
  return <img src={Globe} className={className} />;
};
