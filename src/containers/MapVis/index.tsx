/*
 * Component containing various visualisations of data on world map.
 */
import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';
import * as moment from 'moment';
import * as Loadable from 'react-loadable';

import {getCycle, getData, getMaxWindSpeed} from '../../utils/fielddata';
import VectorField from '../../utils/fielddata/VectorField';
import DataField from '../../utils/fielddata/DataField';
import {
  State as FieldDataState,
  tauToDt,
  tauAvailable,
} from './fieldDataReducer';
import {RootState, RootAction as Action} from '../../reducers';
import ParticleRenderer from '../../components/ParticleRenderer';
import MouseManager from '../../components/MouseManager';
import BackgroundMap from '../../components/BackgroundMap';
import SpeedRenderer from '../../components/SpeedRenderer';
import {setCursorData, resetCursorData, setCenterPoint} from './actions';
import {setCycle, addData} from './fieldDataActions';
import {setZoomLevel} from '../ControlPanel/actions';
import Spinner from '../../components/Spinner';
import {setGlUnavailable} from '../App/actions';

const TAU_STEP_INTERVAL = 500; // Milliseconds to wait before stepping to next tau

const VectorRenderer = Loadable({
  loader: () =>
    import(/* webpackChunkName: "vectorRenderer" */ '../../components/VectorRenderer'),
  loading: (props: {pastDelay: boolean}) =>
    props.pastDelay ? <Spinner color="white" /> : null,
});

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  displaySpeeds: true,
  paused: state.controlPanel.paused,
  zoomLevel: state.controlPanel.zoomLevel,
  centerLon: state.mapVis.centerLon,
  centerLat: state.mapVis.centerLat,
  fieldData: state.fieldData,
  frameRate: state.app.frameRate,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setCursorData,
      resetCursorData,
      setCenterPoint,
      setZoomLevel,
      setCycle,
      addData,
      setGlUnavailable,
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
  displaySpeeds: boolean;
  paused: boolean;
  fieldData: FieldDataState;
  frameRate: number;
  setCursorData: (lon: number, lat: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lon: number, lat: number) => Action;
  setZoomLevel: (zoomLevel: number) => Action;
  setCycle: (cycle: moment.Moment) => Action;
  addData: (tau: number, data: {u: Float32Array; v: Float32Array}) => Action;
  setGlUnavailable: () => Action;
}
interface State {
  currentTau: number; // Tau value currently being displayed
  maxWindSpeed: number | null; // Max wind speed over all taus
}
class MapVis extends React.Component<Props, State> {
  prevStepTime = new Date(); // time of previous tau step
  stepRemainingTime = TAU_STEP_INTERVAL; // time remaining before stepping to next tau
  setNextTauSetTimeoutId: number | null = null; // Id for setTimeout called with setNextTau
  tausToFetch = [...Array(61).keys()].map((x: number) => 180 - 3 * x); // Queue of times fetch data for
  awaitingData = false; // Trying to set current tau but that data is not yet available?

  constructor(props: Props) {
    super(props);
    this.state = {currentTau: 0, maxWindSpeed: null};
  }

  componentDidMount() {
    this.fetchNextTau();
    this.setNextTau();
    this.setMaxWindSpeed();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.paused && !prevProps.paused) {
      this.pause();
    } else if (!this.props.paused && prevProps.paused) {
      this.unPause();
    } else if (this.awaitingData) {
      this.setNextTau();
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // For perf reasons don't update when frame rate changes
    return (
      this.propsChanged(nextProps, ['frameRate']) ||
      this.stateChanged(nextState)
    );
  }

  /*
   * Check if any props changed, ignoring any props in the
   * ignore array. Used by shouldComponentUpdate to avoid
   * updates for some prop changes.
   */
  propsChanged(nextProps: Props, ignore?: string[]) {
    let key: keyof Props;
    for (key in nextProps) {
      if (nextProps.hasOwnProperty(key)) {
        if (
          (ignore == null || ignore.indexOf(key) === -1) &&
          nextProps[key] !== this.props[key]
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /*
   * Check if any state changed, ignoring any state in the
   * ignore array. Used by shouldComponentUpdate to avoid
   * updates for some state changes.
   */
  stateChanged(nextState: State, ignore?: string[]) {
    let key: keyof State;
    for (key in nextState) {
      if (nextState.hasOwnProperty(key)) {
        if (
          (ignore == null || ignore.indexOf(key) === -1) &&
          nextState[key] !== this.state[key]
        ) {
          return true;
        }
      }
    }
    return false;
  }

  pause() {
    if (this.setNextTauSetTimeoutId != null) {
      clearTimeout(this.setNextTauSetTimeoutId);
      this.setNextTauSetTimeoutId = null;
    }
    this.stepRemainingTime =
      TAU_STEP_INTERVAL - (Date.now() - this.prevStepTime.getTime());
  }

  unPause() {
    this.setNextTauSetTimeoutId = setTimeout(
      this.setNextTau.bind(this),
      this.stepRemainingTime,
    );
  }

  getProjState() {
    return {
      screen: {
        width: this.props.width,
        height: this.props.height,
      },
      zoomLevel: this.props.zoomLevel,
      centerCoord: {
        lon: this.props.centerLon,
        lat: this.props.centerLat,
      },
    };
  }

  /*
   * Async fetch next data in this.tausToFetch, the call self again until
   * out of data to fetch.
   */
  fetchNextTau() {
    if (this.props.fieldData.cycle == null) {
      // Need to know model cycle to fetch tau, get it and try again.
      getCycle().then((cycle: moment.Moment) => {
        this.props.setCycle(cycle);
        this.fetchNextTau();
      });
    } else {
      const cyc = moment(this.props.fieldData.cycle);
      if (cyc != null) {
        const tau = this.tausToFetch.pop();
        if (tau != null) {
          getData(cyc, tau).then((data: {u: Float32Array; v: Float32Array}) => {
            this.props.addData(tau, data);
            this.fetchNextTau();
          });
        }
      } else {
        throw new Error('Invalid cycle value: ' + this.props.fieldData.cycle);
      }
    }
  }

  /*
   * Step to the next tau value and setup callback for subsequent step.
   */
  setNextTau() {
    if (!this.props.paused) {
      const nextTau = (this.state.currentTau + 3) % 180;
      if (tauAvailable(this.props.fieldData, nextTau)) {
        this.prevStepTime = new Date();
        this.setState({currentTau: nextTau});
        this.setNextTauSetTimeoutId = setTimeout(
          this.setNextTau.bind(this),
          TAU_STEP_INTERVAL,
        );
        this.awaitingData = false;
      } else {
        this.awaitingData = true;
      }
    }
  }

  setMaxWindSpeed() {
    getMaxWindSpeed().then((maxWindSpeed: number) => {
      this.setState({maxWindSpeed});
    });
  }

  render() {
    const currentDataDt = tauToDt(this.props.fieldData, this.state.currentTau);
    if (
      currentDataDt != null &&
      tauAvailable(this.props.fieldData, this.state.currentTau) &&
      this.state.maxWindSpeed != null
    ) {
      const currentData = this.props.fieldData.data[this.state.currentTau];
      const vectorField = new VectorField(
        new DataField(currentData.u, 0, 359, -90, 90, 1),
        new DataField(currentData.v, 0, 359, -90, 90, 1),
      );

      return (
        <div
          id="map-vis"
          className={style({
            position: 'absolute',
            gridArea: '1 / 1 / -1 / -1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          })}>
          {this.props.displaySpeeds ? (
            <SpeedRenderer
              vectorField={vectorField}
              projState={this.getProjState()}
              maxSpeed={this.state.maxWindSpeed}
              width={this.props.width}
              height={this.props.height}
              setGlUnavailable={this.props.setGlUnavailable}
            />
          ) : null}
          {this.props.displayParticles ? (
            <ParticleRenderer
              vectorField={vectorField}
              projState={this.getProjState()}
              width={this.props.width}
              height={this.props.height}
              resetPariclesOnInit={this.state.currentTau === 0}
              frameRate={this.props.frameRate}
              setGlUnavailable={this.props.setGlUnavailable}
            />
          ) : null}
          {this.props.displayVectors ? (
            <VectorRenderer
              vectorField={vectorField}
              projState={this.getProjState()}
              width={this.props.width}
              height={this.props.height}
            />
          ) : null}
          <MouseManager
            vectorField={vectorField}
            projState={this.getProjState()}
            width={this.props.width}
            height={this.props.height}
            setCursorData={this.props.setCursorData}
            resetCursorData={this.props.resetCursorData}
            setCenterPoint={this.props.setCenterPoint}
            setZoomLevel={this.props.setZoomLevel}
          />
          <BackgroundMap projState={this.getProjState()} />
          <div
            className={style({
              position: 'absolute',
              top: '0',
              left: '0',
              color: 'white',
              padding: '10px',
            })}>
            {currentDataDt.tz('UTC').format('HH:mm UTC DD/MM/YYYY')}
          </div>
        </div>
      );
    } else {
      return <Spinner color="white" />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapVis);
