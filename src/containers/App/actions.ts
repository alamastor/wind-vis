import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'APP_SET_FRAME_RATE';
      frameRate: number;
    }
  | {
      type: 'APP_SET_GL_UNAVAILABLE';
    };

export function setFrameRate(frameRate: number): RootAction {
  return {
    type: 'APP_SET_FRAME_RATE',
    frameRate: frameRate,
  };
}

export function setGlUnavailable(): RootAction {
  return {
    type: 'APP_SET_GL_UNAVAILABLE',
  };
}
