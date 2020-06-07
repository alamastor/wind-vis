import moment from 'moment';
import 'moment-timezone';

import reducer, {State, initialState} from '../fieldDataReducer';
import {addData} from '../fieldDataActions';

/*
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
          u: [1, 2, 2, 3],
          v: [1, 2, 2, 6],
        },
      },
    });
    expect(
      reducer(
        state,
        addData(3, {
          u: [99, 2, 123, 3],
          v: [1, 2, 2, 6],
        }),
      ),
    );
  });
});
*/
