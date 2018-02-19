import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {
  Action,
  setDisplayParticles,
  setDisplayVectors,
  togglePaused,
} from './actions';

import {TauData, ModelData, WIND_FIELDS} from '../../fields';
import {degreesToPixels} from '../../units';
import {RootState} from '../../reducers';

import {
  ParticleRenderer,
  VectorRenderer,
} from '../../components/VectorFieldRenderers';
import BackgroundMap from '../../components/BackgroundMap';
import DisplayOptions from '../../components/DisplayOptions';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.app.displayParticles,
  displayVectors: state.app.displayVectors,
  paused: state.app.paused,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setDisplayParticles: (display: boolean) => {
    dispatch(setDisplayParticles(display));
  },
  setDisplayVectors: (display: boolean) => {
    dispatch(setDisplayVectors(display));
  },
  togglePaused: () => {
    dispatch(togglePaused());
  },
});

interface Props {
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  setDisplayParticles: (display: boolean) => void;
  setDisplayVectors: (display: boolean) => void;
  togglePaused: () => void;
}
interface State {
  currentData: TauData | null;
}
class App extends React.Component<Props, State> {
  dataIdx: number = 0;
  modelData: ModelData | null = null;
  readonly frameInterval: number = 500;
  lastUpdate: Date = new Date();
  updateRemainingTime: number = 500;
  timeoutId: number | null;
  constructor(props: Props) {
    super(props);
    this.state = {currentData: null};
  }

  componentDidMount() {
    WIND_FIELDS.gfsData.then(gfsData => {
      this.modelData = gfsData;
      this.setNextTau();
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.paused && !prevProps.paused) {
      if (this.timeoutId != null) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      this.updateRemainingTime =
        this.frameInterval - (Date.now() - this.lastUpdate.getTime());
    } else if (!this.props.paused && prevProps.paused) {
      setTimeout(
        this.setNextTau.bind(this, this.modelData),
        this.updateRemainingTime,
      );
    }
  }

  setNextTau() {
    if (!this.props.paused && this.modelData != null) {
      this.lastUpdate = new Date();
      this.setState({currentData: this.modelData.data[this.dataIdx]});
      this.timeoutId = setTimeout(
        this.setNextTau.bind(this, this.modelData),
        this.frameInterval,
      );
      if (this.dataIdx < this.modelData.data.length - 1) {
        this.dataIdx++;
      } else {
        this.dataIdx = 0;
      }
    }
  }

  render() {
    if (this.modelData && this.state.currentData) {
      const width = degreesToPixels(this.modelData.getLonDegrees());
      const height = degreesToPixels(this.modelData.getLatDegrees());
      return (
        <div>
          {this.props.displayParticles ? (
            <ParticleRenderer
              vectorField={this.state.currentData.vectorField}
              width={width}
              height={height}
            />
          ) : null}
          {this.props.displayVectors ? (
            <VectorRenderer
              vectorField={this.state.currentData.vectorField}
              width={width}
              height={height}
            />
          ) : null}
          <BackgroundMap width={width} height={height} />
          <div>{this.state.currentData.dt.format('HHZ DD/MM/YYYY')}</div>
          <DisplayOptions
            displayParticles={this.props.displayParticles}
            setDisplayParticles={this.props.setDisplayParticles}
            displayVectors={this.props.displayVectors}
            setDisplayVectors={this.props.setDisplayVectors}
            paused={this.props.paused}
            togglePaused={this.props.togglePaused}
          />
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
