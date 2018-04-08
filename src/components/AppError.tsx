import * as React from 'react';
import {style} from 'typestyle';

export default function AppError({children}: {children: string}) {
  return (
    <div
      className={style({
        width: '100%',
        height: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
        color: 'white',
        fontSize: '2em',
      })}>
      <div>{children}</div>
    </div>
  );
}
