import * as React from 'react';
import {Dispatch, connect} from 'react-redux';

import {RootState} from '../../reducers';
import ControlPanel from '../ControlPanel';
import MapVis from '../MapVis';
import CursorPositionInfo from '../CursorPositionInfo';

const mapStateToProps = (state: RootState) => ({});

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
  render() {
    return (
      <div id="app">
        <MapVis width={1000} height={600} zoom={2} />
        <ControlPanel />
        <CursorPositionInfo />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
