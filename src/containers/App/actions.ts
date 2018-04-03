import {RootAction} from '../../reducers';

export type Action = {
  type: 'APP_SET_FRAME_RATE';
  frameRate: number;
};

export function setFrameRate(frameRate: number): RootAction {
  return {
    type: 'APP_SET_FRAME_RATE',
    frameRate: frameRate,
  };
}
