import {combineReducers} from 'redux';

import appReducer, {AppState} from './containers/App/reducer';

export interface RootState {
  app: AppState;
}
export default combineReducers({app: appReducer});
