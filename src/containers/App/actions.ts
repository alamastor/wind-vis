const BASE = 'windVis/App';

export type Action =
  | {
      type: 'APP_DISPLAY_PARTICLES';
      display: boolean;
    }
  | {
      type: 'APP_DISPLAY_VECTORS';
      display: boolean;
    }
  | {
      type: 'APP_TOGGLE_PAUSE';
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

export function togglePaused(): Action {
  return {type: 'APP_TOGGLE_PAUSE'};
}
