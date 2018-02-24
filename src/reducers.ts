import {combineReducers} from 'redux';

import controlPanelReducer, {
  ControlPanelState,
} from './containers/ControlPanel/reducer';
import {Action as ControlPanelAction} from './containers/ControlPanel/actions';
import mapVisReducer, {State as MapVisState} from './containers/MapVis/reducer';
import {Action as MapVisAction} from './containers/MapVis/actions';

export interface RootState {
  controlPanel: ControlPanelState;
  mapVis: MapVisState;
}

export type RootAction = ControlPanelAction | MapVisAction;

export default combineReducers({
  controlPanel: controlPanelReducer,
  mapVis: mapVisReducer,
});
