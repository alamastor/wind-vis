import * as moment from 'moment';

import {RootAction} from '../../reducers';

export type Action =
  | {
      type: 'FIELD_DATA/SET_CYCLE';
      cycle: string;
    }
  | {
      type: 'FIELD_DATA/ADD_DATA';
      tau: number;
      data: {u: number[][]; v: number[][]};
    };

export function setCycle(cycle: moment.Moment): RootAction {
  return {
    type: 'FIELD_DATA/SET_CYCLE',
    cycle: cycle.format(),
  };
}

export function addData(
  tau: number,
  data: {u: number[][]; v: number[][]},
): RootAction {
  return {
    type: 'FIELD_DATA/ADD_DATA',
    tau: tau,
    data: data,
  };
}
