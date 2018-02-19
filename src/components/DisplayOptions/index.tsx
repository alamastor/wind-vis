import * as React from 'react';

interface Props {
  displayParticles: boolean;
  displayVectors: boolean;
  paused: boolean;
  setDisplayParticles: (display: boolean) => void;
  setDisplayVectors: (display: boolean) => void;
  togglePaused: () => void;
}

export default class extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.handleDisplayParticlesChange = this.handleDisplayParticlesChange.bind(
      this,
    );
    this.handleDisplayVectorsChange = this.handleDisplayVectorsChange.bind(
      this,
    );
    this.handleTogglePaused = this.handleTogglePaused.bind(this);
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
        <button onClick={this.handleTogglePaused}>
          {this.props.paused ? 'Resume' : 'Pause'}
        </button>
      </form>
    );
  }
}
