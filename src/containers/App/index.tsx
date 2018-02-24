import * as React from 'react';
import {Dispatch, connect} from 'react-redux';

import {RootState} from '../../reducers';
import ControlPanel from '../ControlPanel';
import MapVis from '../MapVis';

const mapStateToProps = (state: RootState) => ({});

interface Props {}
interface State {}
class App extends React.Component<Props, State> {
  render() {
    return (
      <div id="app">
        <MapVis />
        <ControlPanel />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
