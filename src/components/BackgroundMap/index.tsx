import * as React from 'react';
import * as ReactDOM from 'react-dom';

const Globe = require('../../img/globe.png');

export default (props: {width: number; height: number}) => (
  <img src={Globe} style={{width: props.width, height: props.height}} />
);
