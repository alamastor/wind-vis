import * as React from 'react';

import {TauData, ModelData, WIND_FIELDS} from '../../fields';

import ParticleField from '../../components/ParticleField';

interface Props {}
interface State {
  currentData: TauData | null;
}
export default class extends React.Component<Props, State> {
  dataIdx: number = 0;
  constructor(props: Props) {
    super(props);
    this.state = {currentData: null};
  }

  componentDidMount() {
    WIND_FIELDS.gfsData.then(gfsData => {
      this.setNextData(gfsData);
    });
  }

  setNextData(gfsData: ModelData) {
    this.setState({currentData: gfsData.data[this.dataIdx]});
    setTimeout(this.setNextData.bind(this, gfsData), 500);
    if (this.dataIdx < gfsData.data.length - 1) {
      this.dataIdx++;
    } else {
      this.dataIdx = 0;
    }
  }

  render() {
    if (this.state.currentData) {
      return (
        <div>
          <ParticleField windField={this.state.currentData.windField} />
          <div>{this.state.currentData.dt.format('HHZ DD/MM/YYYY')}</div>
        </div>
      );
    } else {
      return (
        <div>
          <ParticleField windField={null} />
          <div />
        </div>
      );
    }
  }
}
