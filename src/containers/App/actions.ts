import {DISPLAY_PARTICLES} from './constants';

export type Action = {type: string; [propName: string]: any};

export function setDisplayParticles(display: boolean): Action {
  return {
    type: DISPLAY_PARTICLES,
    display,
  };
}
