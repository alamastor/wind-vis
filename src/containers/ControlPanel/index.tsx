import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';

import {RootState, RootAction as Action} from '../../reducers';
import {
  setDisplayParticles,
  setDisplayVectors,
  togglePaused,
  setZoomLevel,
} from './actions';
import {minZoomLevel, maxZoomLevel} from './reducer';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  paused: state.controlPanel.paused,
  zoomLevel: state.controlPanel.zoomLevel,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setDisplayParticles,
      setDisplayVectors,
      togglePaused,
      setZoomLevel,
    },
    dispatch,
  );

interface Props {
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  zoomLevel: number;
  setDisplayParticles: (display: boolean) => Action;
  setDisplayVectors: (display: boolean) => Action;
  togglePaused: () => Action;
  setZoomLevel: (zoomLevel: number) => Action;
}

class ControlPanel extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.handleDisplayParticlesChange = this.handleDisplayParticlesChange.bind(
      this,
    );
    this.handleDisplayVectorsChange = this.handleDisplayVectorsChange.bind(
      this,
    );
    this.handleTogglePaused = this.handleTogglePaused.bind(this);
    this.handleZoomLevelChange = this.handleZoomLevelChange.bind(this);
  }

  handleDisplayParticlesChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setDisplayParticles(event.target.checked);
  }

  handleDisplayVectorsChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setDisplayVectors(event.target.checked);
  }

  handleTogglePaused(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    this.props.togglePaused();
  }

  handleZoomLevelChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setZoomLevel(Number.parseFloat(event.target.value));
  }

  render() {
    return (
      <form
        className={style({
          gridArea: 'control',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          padding: '10px',
          cursor: 'auto',
          color: 'white',
        })}>
        <label>
          Display Particles:
          <input
            name="displayParticles"
            type="checkbox"
            checked={this.props.displayParticles}
            onChange={this.handleDisplayParticlesChange}
          />
        </label>
        <label>
          Display Vectors:
          <input
            name="displayVectors"
            type="checkbox"
            checked={this.props.displayVectors}
            onChange={this.handleDisplayVectorsChange}
          />
        </label>
        <label>
          Zoom:
          <input
            name="zoomLevel"
            type="range"
            min={minZoomLevel.toString()}
            max={maxZoomLevel.toString()}
            step="0.1"
            value={this.props.zoomLevel}
            onChange={this.handleZoomLevelChange}
          />
        </label>
        <button
          className={style({width: '100%'})}
          onClick={this.handleTogglePaused}>
          {this.props.paused ? 'Resume' : 'Pause'}
        </button>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
