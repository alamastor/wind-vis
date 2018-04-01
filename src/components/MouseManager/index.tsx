import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {RootAction as Action} from '../../reducers';
import VectorField from '../../utils/fielddata/VectorField';
import {
  ProjState,
  transformCoord,
  transformPoint,
  scalePoint,
  maxCenterLat,
  minCenterLat,
} from '../../utils/Projection';
import mod from '../../utils/mod';

interface Props {
  vectorField: VectorField;
  projState: ProjState;
  width: number;
  height: number;
  setCursorData: (lon: number, lat: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  setCenterPoint: (lat: number, lon: number) => Action;
  setZoomLevel: (zoomLevel: number) => Action;
}
interface State {}
export default class MouseManager extends React.Component<Props, State> {
  div!: HTMLDivElement;
  dragging: Boolean = false;
  dragPrevX: number = 0;
  dragPrevY: number = 0;
  cursorLon: number | null = null;
  cursorLat: number | null = null;
  prevPinchZoomDist = 0;

  constructor(props: Props) {
    super(props);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEndOrCancel = this.onTouchEndOrCancel.bind(this);
  }

  componentDidUpdate() {
    if (this.cursorLat != null && this.cursorLon != null) {
      const lat = this.cursorLat;
      const lon = this.cursorLon;
      this.props.setCursorData(
        lon,
        lat,
        this.props.vectorField.uField.getValue(lon, lat),
        this.props.vectorField.vField.getValue(lon, lat),
      );
    }
  }

  onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!this.dragging) {
      const x = event.clientX - this.div.offsetLeft;
      const y = event.clientY - this.div.offsetTop;
      const coord = transformPoint(this.props.projState, {x, y});
      coord.lon = mod(coord.lon, 360);
      if (this.props.vectorField.pointInBounds(coord.lon, coord.lat)) {
        [this.cursorLon, this.cursorLat] = [coord.lon, coord.lat];
        this.props.setCursorData(
          coord.lon,
          coord.lat,
          this.props.vectorField.uField.getValue(coord.lon, coord.lat),
          this.props.vectorField.vField.getValue(coord.lon, coord.lat),
        );
      } else {
        [this.cursorLat, this.cursorLon] = [null, null];
        this.props.resetCursorData();
      }
    }
  }

  onDrag(event: MouseEvent) {
    const deltaX = event.clientX - this.dragPrevX;
    const deltaY = event.clientY - this.dragPrevY;
    const deltaCoord = scalePoint(this.props.projState, {
      x: deltaX,
      y: deltaY,
    });
    const lon = this.props.projState.centerCoord.lon - deltaCoord.lon;
    const lat = this.props.projState.centerCoord.lat - deltaCoord.lat;
    if (
      lat >= minCenterLat(this.props.projState) &&
      lat <= maxCenterLat(this.props.projState)
    ) {
      this.props.setCenterPoint(lon, lat);
    } else {
      this.props.setCenterPoint(lon, this.props.projState.centerCoord.lat);
    }
    this.dragPrevX = event.clientX;
    this.dragPrevY = event.clientY;
  }

  onMouseOut(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    [this.cursorLon, this.cursorLat] = [null, null];
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
    const newZoom = this.props.projState.zoomLevel - event.deltaY / 10;
    this.props.setZoomLevel(newZoom);
    this.preventZoomOffMap(newZoom);
  }

  onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.touches.length == 1) {
      const touch = event.touches[0];
      const x = touch.clientX - this.div.offsetLeft;
      const y = touch.clientY - this.div.offsetTop;
      this.dragPrevX = touch.clientX;
      this.dragPrevY = touch.clientY;
      const coord = transformPoint(this.props.projState, {x, y});
      if (this.props.vectorField.pointInBounds(coord.lon, coord.lat)) {
        [this.cursorLon, this.cursorLat] = [coord.lon, coord.lat];
        this.props.setCursorData(
          coord.lon,
          coord.lat,
          this.props.vectorField.uField.getValue(coord.lon, coord.lat),
          this.props.vectorField.vField.getValue(coord.lon, coord.lat),
        );
      }
    } else {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      this.prevPinchZoomDist = Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
          Math.pow(t1.clientY - t2.clientY, 2),
      );
    }
  }

  onTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.touches.length == 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.dragPrevX;
      const deltaY = touch.clientY - this.dragPrevY;
      const deltaCoord = scalePoint(this.props.projState, {
        x: deltaX,
        y: deltaY,
      });
      const lon = this.props.projState.centerCoord.lon - deltaCoord.lon;
      const lat = this.props.projState.centerCoord.lat - deltaCoord.lat;
      if (
        lat >= minCenterLat(this.props.projState) &&
        lat <= maxCenterLat(this.props.projState)
      ) {
        this.props.setCenterPoint(lon, lat);
      } else {
        this.props.setCenterPoint(lon, this.props.projState.centerCoord.lat);
      }
      this.dragPrevX = touch.clientX;
      this.dragPrevY = touch.clientY;
    } else {
      // TODO: Add proper handling like in mousewheel to prevent zooming out of bounds
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const pinchZoomDist = Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
          Math.pow(t1.clientY - t2.clientY, 2),
      );
      const newZoom =
        this.props.projState.zoomLevel *
        (pinchZoomDist / this.prevPinchZoomDist);
      this.props.setZoomLevel(newZoom);
      this.preventZoomOffMap(newZoom);
      this.prevPinchZoomDist = pinchZoomDist;
    }
  }

  onTouchEndOrCancel(event: React.TouchEvent<HTMLDivElement>) {
    event.preventDefault();
    [this.cursorLat, this.cursorLon] = [null, null];
    this.props.resetCursorData();
  }

  preventZoomOffMap(zoomLevel: number) {
    const nextZoomProjState = Object.assign({}, this.props.projState, {
      zoom: zoomLevel,
    });
    if (
      this.props.projState.centerCoord.lat < minCenterLat(nextZoomProjState)
    ) {
      this.props.setCenterPoint(
        this.props.projState.centerCoord.lon,
        minCenterLat(nextZoomProjState),
      );
    } else if (
      this.props.projState.centerCoord.lat > maxCenterLat(nextZoomProjState)
    ) {
      this.props.setCenterPoint(
        this.props.projState.centerCoord.lon,
        maxCenterLat(nextZoomProjState),
      );
    }
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
          cursor: this.dragging ? 'grabbing' : 'grab',
        }}
        onMouseMove={this.onMouseMove}
        onMouseOut={this.onMouseOut}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        onTouchStart={this.onTouchStart}
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEndOrCancel}
        onTouchCancel={this.onTouchEndOrCancel}
      />
    );
  }
}
