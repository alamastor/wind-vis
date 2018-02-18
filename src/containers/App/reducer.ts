import {Action} from './actions';

const initialState = {};

export default function app(state = initialState, action: Action) {
  switch (action.type) {
    default:
      return state;
  }
}
