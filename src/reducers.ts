import {combineReducers} from 'redux';

import controlPanelReducer, {
  ControlPanelState,
} from './containers/ControlPanel/reducer';
import {Action as ControlPanelAction} from './containers/ControlPanel/actions';
import mapVisReducer, {State as MapVisState} from './containers/MapVis/reducer';
import fieldDataReducer, {
  State as FieldDataState,
} from './containers/MapVis/fieldDataReducer';
import {Action as MapVisAction} from './containers/MapVis/actions';
import {Action as FieldDataAction} from './containers/MapVis/fieldDataActions';
import {Action as AppAction} from './containers/App/actions';
import appReducer, {State as AppState} from './containers/App/reducer';

export interface RootState {
  app: AppState;
  controlPanel: ControlPanelState;
  mapVis: MapVisState;
  fieldData: FieldDataState;
}

export type RootAction =
  | AppAction
  | ControlPanelAction
  | MapVisAction
  | FieldDataAction;

export default combineReducers({
  app: appReducer,
  controlPanel: controlPanelReducer,
  mapVis: mapVisReducer,
  fieldData: fieldDataReducer,
});
