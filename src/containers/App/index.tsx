import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';

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
      <div
        id="app"
        className={style({
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateRows: '20vh 1fr 10vh',
          gridTemplateColumns: '1fr 300px',
          gridTemplateAreas: `".... control"
                              ".... ......."
                              "info ......."`,
        })}>
        <MapVis width={window.innerWidth} height={window.innerHeight} />
        <ControlPanel />
        <CursorPositionInfo />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
