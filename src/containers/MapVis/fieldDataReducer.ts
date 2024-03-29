import {DateTime} from 'luxon';
import {RootAction} from '../../reducers';

export interface State {
  readonly cycle: DateTime | null;
  readonly data: {
    [propName: number]: {
      u: Int8Array;
      v: Int8Array;
    };
  };
}

export function tauToDt(fieldData: State, tau: number): DateTime | null {
  return fieldData.cycle == null ? null : fieldData.cycle.plus({hours: tau});
}

export function tauAvailable(fieldData: State, tau: number): boolean {
  return fieldData.data[tau] !== undefined;
}

export const initialState = {
  cycle: null,
  data: {},
};

export default function (
  state: State = initialState,
  action: RootAction,
): State {
  switch (action.type) {
    case 'FIELD_DATA/SET_CYCLE':
      return Object.assign({}, state, {cycle: action.cycle});

    case 'FIELD_DATA/ADD_DATA':
      return Object.assign({}, state, {
        data: Object.assign({}, state.data, {[action.tau]: action.data}),
      });
    default:
      return state;
  }
}
