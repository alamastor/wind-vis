import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';
import {TauData, ModelData, WIND_FIELDS} from '../../fields';
import {degreesToPixels} from '../../units';
import {RootState, RootAction as Action} from '../../reducers';
import ParticleRenderer from '../../components/ParticleRenderer';
import VectorRenderer from '../../components/VectorRenderer';
import MouseManager from '../../components/MouseManager';
import BackgroundMap from '../../components/BackgroundMap';
import {setCursorData, resetCursorData, setCenterPoint} from './actions';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  paused: state.controlPanel.paused,
  zoomLevel: state.controlPanel.zoomLevel,
  centerLat: state.mapVis.centerLat,
  centerLon: state.mapVis.centerLon,
  showParticleTails: state.controlPanel.showParticleTails,
  clearParticlesEachFrame: state.controlPanel.clearParticlesEachFrame,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setCursorData,
      resetCursorData,
      setCenterPoint,
    },
    dispatch,
  );

interface Props {
  width: number;
  height: number;
  zoomLevel: number;
  centerLat: number;
  centerLon: number;
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
  setCursorData: (lat: number, lon: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lat: number, lon: number) => Action;
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
      return (
        <div
          id="map-vis"
          className={style({
            width: this.props.width,
            height: this.props.height,
          })}>
          {this.props.displayParticles ? (
            <ParticleRenderer
              vectorField={this.state.currentData.vectorField}
              width={this.props.width}
              height={this.props.height}
              zoom={this.props.zoomLevel}
              showParticleTails={this.props.showParticleTails}
              clearParticlesEachFrame={this.props.clearParticlesEachFrame}
              centerLat={this.props.centerLat}
              centerLon={this.props.centerLon}
            />
          ) : null}
          {this.props.displayVectors ? (
            <VectorRenderer
              vectorField={this.state.currentData.vectorField}
              width={this.props.width}
              height={this.props.height}
              zoom={this.props.zoomLevel}
              centerLat={this.props.centerLat}
              centerLon={this.props.centerLon}
            />
          ) : null}
          <MouseManager
            vectorField={this.state.currentData.vectorField}
            width={this.props.width}
            height={this.props.height}
            zoom={this.props.zoomLevel}
            centerLat={this.props.centerLat}
            centerLon={this.props.centerLon}
            setCursorData={this.props.setCursorData}
            resetCursorData={this.props.resetCursorData}
            setCenterPoint={this.props.setCenterPoint}
          />
          <BackgroundMap
            width={this.props.width}
            height={this.props.height}
            zoom={this.props.zoomLevel}
            centerLat={this.props.centerLat}
            centerLon={this.props.centerLon}
          />
          <div className={style({position: 'absolute', top: 0, left: 0})}>
            {this.state.currentData.dt.format('HHZ DD/MM/YYYY')}
          </div>
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
