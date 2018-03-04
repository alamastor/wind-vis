import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {RootAction as Action} from '../../reducers';
import VectorField from '../../utils/fielddata/VectorField';
import Projection from '../../Projection';

interface Props {
  vectorField: VectorField;
  projection: Projection;
  width: number;
  height: number;
  centerLat: number;
  centerLon: number;
  zoomLevel: number;
  setCursorData: (lat: number, lon: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lat: number, lon: number) => Action;
  setZoomLevel: (zoomLevel: number) => Action;
}
interface State {}
export default class MouseManager extends React.Component<Props, State> {
  div: HTMLDivElement;
  dragging: Boolean = false;
  dragPrevX: number = 0;
  dragPrevY: number = 0;
  cursorLat: number | null = null;
  cursorLon: number | null = null;

  constructor(props: Props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  componentDidUpdate() {
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
    if (!this.dragging) {
      const lat = this.props.projection.transformY(
        event.clientY - this.div.offsetTop,
      );
      const lon = this.props.projection.transformX(
        event.clientX - this.div.offsetLeft,
      );
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

  onDrag(event: MouseEvent) {
    event.preventDefault();
    this.props.setCenterPoint(
      this.props.centerLat +
        this.props.projection.scaleY(event.clientY - this.dragPrevY),
      this.props.centerLon -
        this.props.projection.scaleX(event.clientX - this.dragPrevX),
    );
    this.dragPrevX = event.clientX;
    this.dragPrevY = event.clientY;
  }

  onMouseOut(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    [this.cursorLat, this.cursorLon] = [null, null];
    this.props.resetCursorData();
    this.dragging = false;
  }

  onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    this.dragging = true;
    this.dragPrevX = event.clientX;
    this.dragPrevY = event.clientY;
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseUp(event: MouseEvent) {
    event.preventDefault();
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.dragging = false;
  }

  onWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    this.props.setZoomLevel(this.props.zoomLevel - event.deltaY / 10);
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
        onWheel={this.onWheel}
      />
    );
  }
}
