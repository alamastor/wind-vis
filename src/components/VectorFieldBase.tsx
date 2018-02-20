import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {VectorField} from '../fields';

interface Props {
  vectorField: VectorField;
  height: number;
  width: number;
}
interface State {}

export default abstract class<P, S> extends React.Component<
  Props & P,
  State & S
> {
  scaleX(xUnits: number) {
    return xUnits * (this.props.width / this.props.vectorField.getWidth());
  }

  xToComponentX(x: number) {
    return this.scaleX(x);
  }

  scaleY(yUnits: number) {
    return (
      yUnits * (this.props.height / (this.props.vectorField.getHeight() - 1))
    );
  }

  yToComponentY(y: number) {
    return this.props.height - this.scaleY(y);
  }
}
