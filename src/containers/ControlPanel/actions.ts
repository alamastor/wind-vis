export type Action =
  | {
      type: 'CONTROL_PANEL_DISPLAY_PARTICLES';
      display: boolean;
    }
  | {
      type: 'CONTROL_PANEL_DISPLAY_VECTORS';
      display: boolean;
    }
  | {
      type: 'CONTROL_PANEL_TOGGLE_PAUSE';
    }
  | {
      type: 'CONTROL_PANEL_SHOW_PARTICLE_TAILS';
      show: boolean;
    }
  | {
      type: 'CONTROL_PANEL_CLEAR_PARTICLES_EACH_FRAME';
      clear: boolean;
    };

export function setDisplayParticles(display: boolean): Action {
  return {
    type: 'CONTROL_PANEL_DISPLAY_PARTICLES',
    display,
  };
}

export function setDisplayVectors(display: boolean): Action {
  return {
    type: 'CONTROL_PANEL_DISPLAY_VECTORS',
    display,
  };
}

export function togglePaused(): Action {
  return {type: 'CONTROL_PANEL_TOGGLE_PAUSE'};
}

export function setShowParticleTails(show: boolean): Action {
  return {
    type: 'CONTROL_PANEL_SHOW_PARTICLE_TAILS',
    show,
  };
}

export function setClearParticlesEachFrame(clear: boolean): Action {
  return {
    type: 'CONTROL_PANEL_CLEAR_PARTICLES_EACH_FRAME',
    clear,
  };
}
