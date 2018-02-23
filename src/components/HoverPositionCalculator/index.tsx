import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../../fields';
import Projection from '../../Projection';

interface Props {
  vectorField: VectorField;
  width: number;
  height: number;
}
interface State {}
export default class extends React.Component<Props, State> {
  proj: Projection;
  div: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.proj = new Projection(
      props.vectorField.getMinLat(),
      props.vectorField.getMaxLat(),
      props.vectorField.getMinLon(),
      props.vectorField.getMaxLon(),
      props.width,
      props.height,
    );
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const lat = this.proj.transformY(event.clientY - this.div.offsetTop);
    const lon = this.proj.transformX(event.clientX - this.div.offsetLeft);
    console.log(
      `lat: ${lat}, lon: ${lon}, u: ${this.props.vectorField.uField.getValue(
        lat,
        lon,
      )}, v: ${this.props.vectorField.vField.getValue(lat, lon)}`,
    );
  }

  render() {
    return (
      <div
        id="hover-position-calculator"
        ref={(div: HTMLDivElement) => {
          this.div = div;
        }}
        style={{
          position: 'fixed',
          width: this.props.width,
          height: this.props.height,
        }}
        onMouseMove={this.onMouseMove}
      />
    );
  }
}
