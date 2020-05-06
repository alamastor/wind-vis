import {combineReducers} from 'redux';

import mapVisReducer, {MapVisState} from './containers/MapVis/reducer';
import fieldDataReducer, {
  State as FieldDataState,
} from './containers/MapVis/fieldDataReducer';
import {Action as MapVisAction} from './containers/MapVis/actions';
import {Action as FieldDataAction} from './containers/MapVis/fieldDataActions';
import {Action as AppAction} from './containers/App/actions';
import appReducer, {State as AppState} from './containers/App/reducer';

export interface RootState {
  app: AppState;
  mapVis: MapVisState;
  fieldData: FieldDataState;
}

export type RootAction = AppAction | MapVisAction | FieldDataAction;

export default combineReducers({
  app: appReducer,
  mapVis: mapVisReducer,
  fieldData: fieldDataReducer,
});
