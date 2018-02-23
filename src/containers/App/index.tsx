import * as React from 'react';
import {Dispatch, connect} from 'react-redux';

import {TauData, ModelData, WIND_FIELDS} from '../../fields';
import {degreesToPixels} from '../../units';
import {RootState} from '../../reducers';
import ParticleRenderer from '../../components/ParticleRenderer';
import VectorRenderer from '../../components/VectorRenderer';
import HoverPositionCalculator from '../../components/HoverPositionCalculator';
import BackgroundMap from '../../components/BackgroundMap';
import ControlPanel from '../../containers/ControlPanel';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  paused: state.controlPanel.paused,
  showParticleTails: state.controlPanel.showParticleTails,
  clearParticlesEachFrame: state.controlPanel.clearParticlesEachFrame,
});

interface Props {
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
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
              showParticleTails={this.props.showParticleTails}
              clearParticlesEachFrame={this.props.clearParticlesEachFrame}
            />
          ) : null}
          {this.props.displayVectors ? (
            <VectorRenderer
              vectorField={this.state.currentData.vectorField}
              width={width}
              height={height}
            />
          ) : null}
          <HoverPositionCalculator
            width={width}
            height={height}
            minLat={-90}
            maxLat={90}
            minLon={0}
            maxLon={359}
          />
          <BackgroundMap width={width} height={height} />
          <div>{this.state.currentData.dt.format('HHZ DD/MM/YYYY')}</div>
          <ControlPanel />
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default connect(mapStateToProps)(App);
