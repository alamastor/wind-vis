import {combineReducers} from 'redux';

import appReducer, {AppState} from './containers/App/reducer';
import {Action as AppAction} from './containers/App/actions';

export interface RootState {
  app: AppState;
}

export default combineReducers({app: appReducer});
