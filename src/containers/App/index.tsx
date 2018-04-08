import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {style} from 'typestyle';

import AppError from '../../components/AppError';
import {RootState, RootAction as Action} from '../../reducers';
import ControlPanel from '../ControlPanel';
import MapVis from '../MapVis';
import CursorPositionInfo from '../CursorPositionInfo';
import {setFrameRate} from './actions';

const mapStateToProps = (state: RootState) => ({
  glUnavailable: state.app.glUnavailable,
});
const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setFrameRate,
    },
    dispatch,
  );

interface Props {
  glUnavailable: boolean;
  setFrameRate: (frameRate: number) => Action;
}
interface State {
  width: number;
  height: number;
}
class App extends React.Component<Props, State> {
  prevFrameTimestamp: number | null = null;
  frameLengths: number[] = [...Array(180)].map(() => 0);
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
    requestAnimationFrame(this.updateFrameRate.bind(this));
  }

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  updateFrameRate(timestamp: number) {
    if (this.prevFrameTimestamp != null) {
      const frameLength = timestamp - this.prevFrameTimestamp;
      this.frameLengths.shift();
      this.frameLengths.push(frameLength);
      const meanFrameLength =
        this.frameLengths.reduce((len, cum) => len + cum, 0) /
        this.frameLengths.length;
      const meanFrameRate = 1000 / frameLength;
      this.props.setFrameRate(meanFrameRate);
    }
    this.prevFrameTimestamp = timestamp;
    requestAnimationFrame(this.updateFrameRate.bind(this));
  }

  render() {
    const className = style({
      display: 'grid',
      width: '100%',
      height: '100%',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateColumns: 'auto 1fr auto',
      gridTemplateAreas: `".... . ......."
                              ".... . ......."
                              "info . control"`,
      backgroundColor: '#624a72',
    });
    return this.props.glUnavailable ? (
      <div id="app" className={className}>
        <AppError>
          Not available in this browser, please try another one!
        </AppError>
      </div>
    ) : (
      <div id="app" className={className}>
        <MapVis width={this.state.width} height={this.state.height} />
        <ControlPanel />
        <CursorPositionInfo />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
