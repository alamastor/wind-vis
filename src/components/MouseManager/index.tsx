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
interface State {}
export default class extends React.Component<Props, State> {
  proj: Projection;
  div: HTMLDivElement;
  dragging: Boolean = false;
  cursorLat: number | null = null;
  cursorLon: number | null = null;

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
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
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
    if (this.cursorLat != null && this.cursorLon != null) {
      const lat = this.cursorLat;
      const lon = this.cursorLon;
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
      [this.cursorLat, this.cursorLon] = [lat, lon];
      this.props.updateCursorData(
        lat,
        lon,
        this.props.vectorField.uField.getValue(lat, lon),
        this.props.vectorField.vField.getValue(lat, lon),
      );
    } else {
      [this.cursorLat, this.cursorLon] = [null, null];
      this.props.resetCursorData();
    }
  }

  onMouseOut() {
    [this.cursorLat, this.cursorLon] = [null, null];
    this.props.resetCursorData();
  }

  onMouseDown() {
    this.dragging = true;
  }

  onMouseUp() {
    this.dragging = false;
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
        onMouseDown={this.onMouseDown}
      />
    );
  }
}
