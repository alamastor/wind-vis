import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';
import * as moment from 'moment';
import * as Loadable from 'react-loadable';

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
import MouseManager from '../../components/MouseManager';
import BackgroundMap from '../../components/BackgroundMap';
import SpeedRenderer from '../../components/SpeedRenderer';
import {setCursorData, resetCursorData, setCenterPoint} from './actions';
import {setCycle, addData} from './fieldDataActions';
import {setZoomLevel} from '../ControlPanel/actions';
import Spinner from '../../components/Spinner';

const VectorRenderer = Loadable({
  loader: () =>
    import(/* webpackChunkName: "vectorRenderer" */ '../../components/VectorRenderer'),
  loading: () => <Spinner color="white" />,
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
  displaySpeeds: boolean;
  paused: boolean;
  fieldData: FieldDataState;
  setCursorData: (lon: number, lat: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lon: number, lat: number) => Action;
  setZoomLevel: (zoomLevel: number) => Action;
  setCycle: (cycle: moment.Moment) => Action;
  addData: (tau: number, data: {u: Float32Array; v: Float32Array}) => Action;
}
interface State {
  currentTau: number;
}
class MapVis extends React.Component<Props, State> {
  readonly frameInterval = 500;
  lastUpdate = new Date();
  updateRemainingTime = 500;
  timeoutId: number | null = null;
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
        getData(cyc, tau).then((data: {u: Float32Array; v: Float32Array}) => {
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
              width={this.props.width}
              height={this.props.height}
            />
          ) : null}
          {this.props.displayParticles ? (
            <ParticleRenderer
              vectorField={vectorField}
              projState={this.getProjState()}
              width={this.props.width}
              height={this.props.height}
              resetPariclesOnInit={this.state.currentTau === 0}
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
