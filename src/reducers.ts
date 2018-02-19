import {combineReducers} from 'redux';

import controlPanelReducer, {
  ControlPanelState,
} from './containers/ControlPanel/reducer';

export interface RootState {
  controlPanel: ControlPanelState;
}

export default combineReducers({controlPanel: controlPanelReducer});
