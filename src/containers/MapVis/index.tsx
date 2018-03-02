import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';
import * as moment from 'moment';

import {getCycle, getData} from '../../utils/fielddata';
import VectorField from '../../utils/fielddata/VectorField';
import DataField from '../../utils/fielddata/DataField';
import {
  State as FieldDataState,
  tauToDt,
  tauAvailable,
} from './fieldDataReducer';
import {RootState, RootAction as Action} from '../../reducers';
import ParticleRenderer from '../../components/ParticleRenderer';
import VectorRenderer from '../../components/VectorRenderer';
import MouseManager from '../../components/MouseManager';
import BackgroundMap from '../../components/BackgroundMap';
import {setCursorData, resetCursorData, setCenterPoint} from './actions';
import {setCycle, addData} from './fieldDataActions';
import {setZoomLevel} from '../ControlPanel/actions';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  paused: state.controlPanel.paused,
  zoomLevel: state.controlPanel.zoomLevel,
  centerLat: state.mapVis.centerLat,
  centerLon: state.mapVis.centerLon,
  showParticleTails: state.controlPanel.showParticleTails,
  clearParticlesEachFrame: state.controlPanel.clearParticlesEachFrame,
  fieldData: state.fieldData,
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
  fieldData: FieldDataState;
  setCursorData: (lat: number, lon: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lat: number, lon: number) => Action;
  setZoomLevel: (zoomLevel: number) => Action;
  setCycle: (cycle: moment.Moment) => Action;
  addData: (tau: number, data: {u: number[][]; v: number[][]}) => Action;
}
interface State {
  currentTau: number;
}
class MapVis extends React.Component<Props, State> {
  readonly frameInterval = 500;
  lastUpdate = new Date();
  updateRemainingTime = 500;
  timeoutId: number | null;
  tausToFetch = [...Array(61).keys()].map((x: number) => 180 - 3 * x);
  awaitingData = false;

  constructor(props: Props) {
    super(props);
    this.state = {currentTau: 0};
  }

  componentDidMount() {
    this.fetchNextTau();
    this.setNextTau();
  }

  fetchNextTau() {
    if (this.props.fieldData.cycle == null) {
      getCycle().then((cycle: moment.Moment) => {
        this.props.setCycle(cycle);
        this.fetchNextTau();
      });
    } else {
      const tau = this.tausToFetch.pop();
      const cyc = moment(this.props.fieldData.cycle);
      if (cyc != null && tau != null) {
        getData(cyc, tau).then((data: {u: number[][]; v: number[][]}) => {
          this.props.addData(tau, data);
          this.fetchNextTau();
        });
      }
    }
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
      setTimeout(this.setNextTau.bind(this), this.updateRemainingTime);
    } else if (this.awaitingData) {
      this.setNextTau();
    }
  }

  setNextTau() {
    if (!this.props.paused) {
      const nextTau = (this.state.currentTau + 3) % 180;
      if (tauAvailable(this.props.fieldData, nextTau)) {
        this.lastUpdate = new Date();
        this.setState({currentTau: nextTau});
        this.timeoutId = setTimeout(
          this.setNextTau.bind(this),
          this.frameInterval,
        );
        this.awaitingData = false;
      } else {
        this.awaitingData = true;
      }
    }
  }

  render() {
    const currentDataDt = tauToDt(this.props.fieldData, this.state.currentTau);
    if (
      currentDataDt != null &&
      tauAvailable(this.props.fieldData, this.state.currentTau)
    ) {
      const currentData = this.props.fieldData.data[this.state.currentTau];
      const vectorField = new VectorField(
        new DataField(currentData.u, -90, 90, 0, 359, 1),
        new DataField(currentData.v, -90, 90, 0, 359, 1),
      );
      return (
        <div
          id="map-vis"
          className={style({
            width: this.props.width,
            height: this.props.height,
          })}>
          {this.props.displayParticles ? (
            <ParticleRenderer
              vectorField={vectorField}
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
              vectorField={vectorField}
              width={this.props.width}
              height={this.props.height}
              zoom={this.props.zoomLevel}
              centerLat={this.props.centerLat}
              centerLon={this.props.centerLon}
            />
          ) : null}
          <MouseManager
            vectorField={vectorField}
            width={this.props.width}
            height={this.props.height}
            zoomLevel={this.props.zoomLevel}
            centerLat={this.props.centerLat}
            centerLon={this.props.centerLon}
            setCursorData={this.props.setCursorData}
            resetCursorData={this.props.resetCursorData}
            setCenterPoint={this.props.setCenterPoint}
            setZoomLevel={this.props.setZoomLevel}
          />
          <BackgroundMap
            width={this.props.width}
            height={this.props.height}
            zoom={this.props.zoomLevel}
            centerLat={this.props.centerLat}
            centerLon={this.props.centerLon}
          />
          <div className={style({position: 'absolute', top: 0, left: 0})}>
            {currentDataDt.tz('UTC').format('HHZ DD/MM/YYYY')}
          </div>
        </div>
      );
    } else if (currentDataDt != null) {
      return (
        <div
          id="spinner"
          className={style({
            width: this.props.width,
            height: this.props.height,
          })}>
          <div className={style({position: 'absolute', top: 0, left: 0})}>
            <div>{currentDataDt.tz('UTC').format('HHZ DD/MM/YYYY')}</div>
            <div>Fetching Data</div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          id="spinner"
          className={style({
            width: this.props.width,
            height: this.props.height,
          })}>
          <div>Fetching Data</div>
        </div>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapVis);
