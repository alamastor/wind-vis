import * as React from 'react';
import {style} from 'typestyle';

import './ball-grid-pulse.css';

const mainStyle = style({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
});

const Spinner = (props: {color: string}) => (
  <div className={mainStyle}>
    <div className={'la-ball-grid-pulse la-2x ' + style({})}>
      {[...Array(9).keys()].map((i) => (
        <div key={i} style={{color: props.color}} />
      ))}
    </div>
  </div>
);

export default Spinner;
