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
  centerLat: number;
  centerLon: number;
  setCursorData: (lat: number, lon: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lat: number, lon: number) => Action;
}
interface State {}
export default class MouseManager extends React.Component<Props, State> {
  proj: Projection;
  div: HTMLDivElement;
  dragging: Boolean = false;
  dragPrevX: number = 0;
  dragPrevY: number = 0;
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
      props.centerLat,
      props.centerLon,
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
      this.props.centerLat,
      this.props.centerLon,
    );
    if (this.cursorLat != null && this.cursorLon != null) {
      const lat = this.cursorLat;
      const lon = this.cursorLon;
      this.props.setCursorData(
        lat,
        lon,
        this.props.vectorField.uField.getValue(lat, lon),
        this.props.vectorField.vField.getValue(lat, lon),
      );
    }
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (this.dragging) {
      this.props.setCenterPoint(
        this.props.centerLat + this.proj.scaleY(event.clientY - this.dragPrevY),
        this.props.centerLon - this.proj.scaleX(event.clientX - this.dragPrevX),
      );
      this.dragPrevX = event.clientX;
      this.dragPrevY = event.clientY;
    } else {
      const lat = this.proj.transformY(event.clientY - this.div.offsetTop);
      const lon = this.proj.transformX(event.clientX - this.div.offsetLeft);
      if (this.props.vectorField.pointInBounds(lat, lon)) {
        [this.cursorLat, this.cursorLon] = [lat, lon];
        this.props.setCursorData(
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
  }

  onMouseOut() {
    [this.cursorLat, this.cursorLon] = [null, null];
    this.props.resetCursorData();
    this.dragging = false;
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    this.dragging = true;
    this.dragPrevX = event.clientX;
    this.dragPrevY = event.clientY;
  }

  onMouseUp() {
    this.dragging = false;
  }

  render() {
    return (
      <div
        id="mouse-manager"
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
        onMouseUp={this.onMouseUp}
        onDragStart={() => {
          console.log('onDragStart');
        }}
        onDrag={() => {
          console.log('onDrag');
        }}
      />
    );
  }
}
