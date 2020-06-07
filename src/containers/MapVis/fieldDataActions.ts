import {RootAction} from '../../reducers';
import {WindData} from '../../../rust_pkg/index';

export type Action =
  | {
      type: 'FIELD_DATA/SET_WIND_DATA';
      windData: WindData;
    }
  | {
      type: 'FIELD_DATA/ADD_DATA';
      tau: number;
      data: {u: number[]; v: number[]};
    };

export function setWindData(windData: WindData): RootAction {
  return {
    type: 'FIELD_DATA/SET_WIND_DATA',
    windData,
  };
}

export function addData(
  tau: number,
  data: {u: number[]; v: number[]},
): RootAction {
  return {
    type: 'FIELD_DATA/ADD_DATA',
    tau: tau,
    data: data,
  };
}
