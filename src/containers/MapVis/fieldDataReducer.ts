import moment, {Moment} from 'moment';

import {RootAction} from '../../reducers';
import {WindData} from '../../../rust_pkg/index';

export interface State {
  readonly windData: WindData | null;
}

export function tauToDt(fieldData: State, tau: number): moment.Moment | null {
  if (fieldData.windData != null) {
    return moment(fieldData.windData.cycle()).add(tau, 'hours');
  } else {
    return null;
  }
}

export function tauAvailable(fieldData: State, tau: number): boolean {
  return fieldData.windData != null && fieldData.windData.has_tau(tau);
}

export const initialState = {
  windData: null,
};

export default function (
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'FIELD_DATA/SET_WIND_DATA':
      return Object.assign({}, state, {windData: action.windData});

    case 'FIELD_DATA/ADD_DATA':
      if (state.windData != null) {
        state.windData.set_data(action.tau, action.data);
      }
      return Object.assign({}, state, {windData: state.windData});
    default:
      return state;
  }
}
