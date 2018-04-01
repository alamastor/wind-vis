import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';

import {RootState} from '../../reducers';
import ControlPanel from '../ControlPanel';
import MapVis from '../MapVis';
import CursorPositionInfo from '../CursorPositionInfo';

const mapStateToProps = (state: RootState) => ({});

interface Props {}
interface State {
  width: number;
  height: number;
}
class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  render() {
    return (
      <div
        id="app"
        className={style({
          display: 'grid',
          width: '100%',
          height: '100%',
          gridTemplateRows: 'auto 1fr auto',
          gridTemplateColumns: 'auto 1fr auto',
          gridTemplateAreas: `".... . ......."
                              ".... . ......."
                              "info . control"`,
          backgroundColor: '#624a72',
        })}>
        <MapVis width={this.state.width} height={this.state.height} />
        <ControlPanel />
        <CursorPositionInfo />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
