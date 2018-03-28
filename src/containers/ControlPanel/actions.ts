import {RootAction} from '../../reducers';

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
      type: 'CONTROL_PANEL_SET_ZOOM_LEVEL';
      zoomLevel: number;
    };

export function setDisplayParticles(display: boolean): RootAction {
  return {
    type: 'CONTROL_PANEL_DISPLAY_PARTICLES',
    display,
  };
}

export function setDisplayVectors(display: boolean): RootAction {
  return {
    type: 'CONTROL_PANEL_DISPLAY_VECTORS',
    display,
  };
}

export function togglePaused(): RootAction {
  return {type: 'CONTROL_PANEL_TOGGLE_PAUSE'};
}

export function setZoomLevel(zoomLevel: number): RootAction {
  return {
    type: 'CONTROL_PANEL_SET_ZOOM_LEVEL',
    zoomLevel,
  };
}
