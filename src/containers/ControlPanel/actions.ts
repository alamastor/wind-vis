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
