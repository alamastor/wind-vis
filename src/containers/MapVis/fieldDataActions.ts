import {DateTime} from 'luxon';
import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'FIELD_DATA/SET_CYCLE';
      cycle: DateTime;
    }
  | {
      type: 'FIELD_DATA/ADD_DATA';
      tau: number;
      data: {u: Float32Array; v: Float32Array};
    };

export function setCycle(cycle: DateTime): RootAction {
  return {
    type: 'FIELD_DATA/SET_CYCLE',
    cycle: cycle,
  };
}

export function addData(
  tau: number,
  data: {u: Float32Array; v: Float32Array},
): RootAction {
  return {
    type: 'FIELD_DATA/ADD_DATA',
    tau: tau,
    data: data,
  };
}
