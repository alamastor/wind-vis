import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Dispatch, connect} from 'react-redux';

import {RootState, RootAction as Action} from '../../reducers';
import {
  setDisplayParticles,
  setDisplayVectors,
  togglePaused,
  setShowParticleTails,
  setClearParticlesEachFrame,
  setZoomLevel,
} from './actions';

const mapStateToProps = (state: RootState) => ({
  displayParticles: state.controlPanel.displayParticles,
  displayVectors: state.controlPanel.displayVectors,
  paused: state.controlPanel.paused,
  showParticleTails: state.controlPanel.showParticleTails,
  clearParticlesEachFrame: state.controlPanel.clearParticlesEachFrame,
  zoomLevel: state.controlPanel.zoomLevel,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) =>
  bindActionCreators(
    {
      setDisplayParticles,
      setDisplayVectors,
      togglePaused,
      setShowParticleTails,
      setClearParticlesEachFrame,
      setZoomLevel,
    },
    dispatch,
  );

interface Props {
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  showParticleTails: boolean;
  clearParticlesEachFrame: boolean;
  zoomLevel: number;
  setDisplayParticles: (display: boolean) => Action;
  setDisplayVectors: (display: boolean) => Action;
  togglePaused: () => Action;
  setShowParticleTails: (show: boolean) => Action;
  setClearParticlesEachFrame: (clear: boolean) => Action;
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
    this.handleShowParticleTailsChange = this.handleShowParticleTailsChange.bind(
      this,
    );
    this.handleClearParticlesEachFrameChange = this.handleClearParticlesEachFrameChange.bind(
      this,
    );
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

  handleShowParticleTailsChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setShowParticleTails(event.target.checked);
  }

  handleClearParticlesEachFrameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    this.props.setClearParticlesEachFrame(event.target.checked);
  }

  handleZoomLevelChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.props.setZoomLevel(Number.parseFloat(event.target.value));
  }

  render() {
    return (
      <form>
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
          Show Particle Tails:
          <input
            name="showParticleTails"
            type="checkbox"
            checked={this.props.showParticleTails}
            onChange={this.handleShowParticleTailsChange}
          />
        </label>
        <label>
          Clear Particles Each Frame:
          <input
            name="clearParticlesEachFrame"
            type="checkbox"
            checked={this.props.clearParticlesEachFrame}
            onChange={this.handleClearParticlesEachFrameChange}
          />
        </label>
        <label>
          Zoom:
          <input
            name="zoomLevel"
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={this.props.zoomLevel}
            onChange={this.handleZoomLevelChange}
          />
        </label>
        <button onClick={this.handleTogglePaused}>
          {this.props.paused ? 'Resume' : 'Pause'}
        </button>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlPanel);
