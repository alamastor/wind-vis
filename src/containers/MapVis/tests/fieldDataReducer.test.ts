import * as moment from 'moment';
import 'moment-timezone';

import reducer, {State, initialState} from '../fieldDataReducer';
import {setCycle, addData} from '../fieldDataActions';
import {RootAction as Action} from '../../../reducers';

describe('fieldDataReducer', () => {
  let state: State;
  beforeEach(() => {
    state = initialState;
  });

  test('it sets cycle correctly', () => {
    const cycle = moment();
    const expected = Object.assign({}, state, {
      cycle: cycle.format(),
    });
    expect(reducer(state, setCycle(cycle))).toEqual(expected);
  });

  test('it adds data correctly', () => {
    state = Object.assign({}, state, {
      data: {
        0: {
          u: new Float32Array([1, 2, 2, 3]),
          v: new Float32Array([1, 2, 2, 6]),
        },
      },
    });
    const expected = Object.assign({}, initialState, {
      data: {
        0: {
          u: new Float32Array([1, 2, 2, 3]),
          v: new Float32Array([1, 2, 2, 6]),
        },
        3: {
          u: new Float32Array([99, 2, 123, 3]),
          v: new Float32Array([1, 2, 2, 6]),
        },
      },
    });
    expect(
      reducer(
        state,
        addData(3, {
          u: new Float32Array([99, 2, 123, 3]),
          v: new Float32Array([1, 2, 2, 6]),
        }),
      ),
    );
  });
});
