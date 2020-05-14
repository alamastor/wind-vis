import * as React from 'react';
import {style} from 'typestyle';

import './ball-grid-pulse.css';

const Spinner = (props: {color: string}) => (
  <div
    className={style({
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
    })}
  >
    <div className={'la-ball-grid-pulse la-2x ' + style({})}>
      {[...Array(9).keys()].map((i) => (
        <div key={i} className={style({color: props.color})} />
      ))}
    </div>
  </div>
);

export default Spinner;
