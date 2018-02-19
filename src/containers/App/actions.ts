const BASE = 'windVis/App';

export type Action =
  | {
      type: 'APP_DISPLAY_PARTICLES';
      display: boolean;
    }
  | {
      type: 'APP_DISPLAY_VECTORS';
      display: boolean;
    };

export function setDisplayParticles(display: boolean): Action {
  return {
    type: 'APP_DISPLAY_PARTICLES',
    display,
  };
}

export function setDisplayVectors(display: boolean): Action {
  return {
    type: 'APP_DISPLAY_VECTORS',
    display,
  };
}
