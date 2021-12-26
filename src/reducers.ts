import {combineReducers} from 'redux';
import {Action as AppAction} from './containers/App/actions';
import appReducer, {State as AppState} from './containers/App/reducer';
import {Action as MapVisAction} from './containers/MapVis/actions';
import {Action as FieldDataAction} from './containers/MapVis/fieldDataActions';
import fieldDataReducer, {
  State as FieldDataState,
} from './containers/MapVis/fieldDataReducer';
import mapVisReducer, {MapVisState} from './containers/MapVis/reducer';

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
