const BASE = 'windVis/App';

export interface Action {
  type: 'APP_DISPLAY_PARTICLES';
  display: boolean;
}

export function setDisplayParticles(display: boolean): Action {
  return {
    type: 'APP_DISPLAY_PARTICLES',
    display,
  };
}
