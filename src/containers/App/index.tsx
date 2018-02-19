import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {Action, setDisplayParticles, setDisplayVectors} from './actions';

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
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setDisplayParticles: (display: boolean) => {
    dispatch(setDisplayParticles(display));
  },
  setDisplayVectors: (display: boolean) => {
    dispatch(setDisplayVectors(display));
  },
});

interface Props {
  displayParticles: boolean;
  setDisplayParticles: (display: boolean) => void;
  displayVectors: boolean;
  setDisplayVectors: (display: boolean) => void;
}
interface State {
  currentData: TauData | null;
}
class App extends React.Component<Props, State> {
  dataIdx: number = 0;
  modelData: ModelData | null = null;
  constructor(props: Props) {
    super(props);
    this.state = {currentData: null};
  }

  componentDidMount() {
    WIND_FIELDS.gfsData.then(gfsData => {
      this.setNextData(gfsData);
    });
  }

  setNextData(modelData: ModelData) {
    this.modelData = modelData;
    this.setState({currentData: modelData.data[this.dataIdx]});
    setTimeout(this.setNextData.bind(this, modelData), 500);
    if (this.dataIdx < modelData.data.length - 1) {
      this.dataIdx++;
    } else {
      this.dataIdx = 0;
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
          />
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
