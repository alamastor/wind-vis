import * as React from 'react';

import {TauData, ModelData, WIND_FIELDS} from '../../fields';
import {degreesToPixels} from '../../units';

import {
  ParticleRenderer,
  VectorRenderer,
} from '../../components/VectorFieldRenderers';
import BackgroundMap from '../../components/BackgroundMap';

interface Props {}
interface State {
  currentData: TauData | null;
}
export default class extends React.Component<Props, State> {
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
          <ParticleRenderer
            vectorField={this.state.currentData.vectorField}
            width={width}
            height={height}
          />
          <VectorRenderer
            vectorField={this.state.currentData.vectorField}
            width={width}
            height={height}
          />
          <BackgroundMap width={width} height={height} />
          <div>{this.state.currentData.dt.format('HHZ DD/MM/YYYY')}</div>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
