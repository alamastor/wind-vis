import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {RootAction as Action} from '../../reducers';
import {VectorField} from '../../fields';
import Projection from '../../Projection';

interface Props {
  vectorField: VectorField;
  width: number;
  height: number;
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
      this.getDivWidth(),
      this.getDivHeight(),
    );
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.state = {cursorLat: null, cursorLon: null};
  }

  getDivWidth() {
    if (this.props.width < this.props.height * 2) {
      // width limited
      return this.props.width;
    } else {
      // height limited
      return this.props.height * 2;
    }
  }

  getDivHeight() {
    if (this.props.width < this.props.height * 2) {
      // width limited
      return this.props.width / 2;
    } else {
      // height limited
      return this.props.height;
    }
  }

  componentDidUpdate() {
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
    this.setState({cursorLat: lat, cursorLon: lon});
    this.props.updateCursorData(
      lat,
      lon,
      this.props.vectorField.uField.getValue(lat, lon),
      this.props.vectorField.vField.getValue(lat, lon),
    );
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
          width: this.getDivWidth(),
          height: this.getDivHeight(),
          marginTop: `${(this.props.height - this.getDivHeight()) / 2}px`,
          marginRight: `${(this.props.width - this.getDivWidth()) / 2}px`,
          marginBottom: `${(this.props.height - this.getDivHeight()) / 2}px`,
          marginLeft: `${(this.props.width - this.getDivWidth()) / 2}px`,
        }}
        onMouseMove={this.onMouseMove}
        onMouseOut={this.onMouseOut}
      />
    );
  }
}
