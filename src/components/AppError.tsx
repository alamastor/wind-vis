/*
 * Display app level error.
 */
import * as React from 'react';
import {style} from 'typestyle';

const mainStyle = style({
  width: '100%',
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  color: 'white',
  fontSize: '2em',
});

export default function AppError({children}: {children: string}) {
  return (
    <div className={mainStyle}>
      <div>{children}</div>
    </div>
  );
}
