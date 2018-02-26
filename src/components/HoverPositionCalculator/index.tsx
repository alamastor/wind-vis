import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {RootAction as Action} from '../../reducers';
import {VectorField} from '../../fields';
import Projection from '../../Projection';

interface Props {
  vectorField: VectorField;
  width: number;
  height: number;
  zoom: number;
  updateCursorData: (lat: number, lon: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
}
interface State {
  cursorLat: number | null;
  cursorLon: number | null;
}
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
      props.zoom,
    );
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.state = {cursorLat: null, cursorLon: null};
  }

  componentDidUpdate() {
    this.proj = new Projection(
      this.props.vectorField.getMinLat(),
      this.props.vectorField.getMaxLat(),
      this.props.vectorField.getMinLon(),
      this.props.vectorField.getMaxLon(),
      this.props.width,
      this.props.height,
      this.props.zoom,
    );
    if (this.state.cursorLat != null && this.state.cursorLon != null) {
      const lat = this.state.cursorLat;
      const lon = this.state.cursorLon;
      this.props.updateCursorData(
        lat,
        lon,
        this.props.vectorField.uField.getValue(lat, lon),
        this.props.vectorField.vField.getValue(lat, lon),
      );
    }
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const lat = this.proj.transformY(event.clientY - this.div.offsetTop);
    const lon = this.proj.transformX(event.clientX - this.div.offsetLeft);
    if (this.props.vectorField.pointInBounds(lat, lon)) {
      this.setState({cursorLat: lat, cursorLon: lon});
      this.props.updateCursorData(
        lat,
        lon,
        this.props.vectorField.uField.getValue(lat, lon),
        this.props.vectorField.vField.getValue(lat, lon),
      );
    } else {
      this.setState({cursorLat: null, cursorLon: null});
      this.props.resetCursorData();
    }
  }

  onMouseOut() {
    this.setState({cursorLat: null, cursorLon: null});
    this.props.resetCursorData();
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
        onMouseOut={this.onMouseOut}
      />
    );
  }
}
