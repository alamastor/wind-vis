import React, {useRef} from 'react';
import {RootAction as Action} from '../../reducers';
import VectorField from '../../utils/fielddata/VectorField';
import {MapState, transformPoint} from '../../utils/mapState';
import mod from '../../utils/mod';

interface MouseManagerProps {
  vectorField: VectorField;
  mapState: MapState;
  width: number;
  height: number;
  setCursorData: (lon: number, lat: number, u: number, v: number) => Action;
  resetCursorData: () => Action;
  moveMap: (
    deltaX: number,
    deltaY: number,
    mapWidth: number,
    mapHeight: number,
  ) => Action;
  setZoomLevel: (
    zoomLevel: number,
    mapWidth: number,
    mapHeight: number,
  ) => Action;
}
export default function MouseManager({
  vectorField,
  mapState,
  width,
  height,
  setCursorData,
  resetCursorData,
  setZoomLevel,
  moveMap,
}: MouseManagerProps) {
  const divRef = useRef<HTMLDivElement>();
  const draggingRef = useRef(false);
  const dragPrevXRef = useRef(0);
  const dragPrevYRef = useRef(0);
  const cursorLonRef = useRef<number | null>(null);
  const cursorLatRef = useRef<number | null>(null);
  const prevPinchZoomDistRef = useRef(0);

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingRef.current) {
      const x =
        divRef.current != null ? event.clientX - divRef.current.offsetLeft : 0;
      const y =
        divRef.current != null ? event.clientY - divRef.current.offsetTop : 0;
      const coord = transformPoint(mapState, {x, y});
      coord.lon = mod(coord.lon, 360);
      if (vectorField.pointInBounds(coord.lon, coord.lat)) {
        [cursorLonRef.current, cursorLatRef.current] = [coord.lon, coord.lat];
        setCursorData(
          coord.lon,
          coord.lat,
          vectorField.uField.getValue(coord.lon, coord.lat),
          vectorField.vField.getValue(coord.lon, coord.lat),
        );
      } else {
        [cursorLatRef.current, cursorLonRef.current] = [null, null];
        resetCursorData();
      }
    }
  };

  const onDrag = (event: MouseEvent) => {
    moveMap(
      event.clientX - dragPrevXRef.current,
      event.clientY - dragPrevYRef.current,
      mapState.canvasDims.width,
      mapState.canvasDims.height,
    );
    dragPrevXRef.current = event.clientX;
    dragPrevYRef.current = event.clientY;
  };

  const onMouseOut = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    [cursorLonRef.current, cursorLatRef.current] = [null, null];
    resetCursorData();
    draggingRef.current = false;
  };

  const onMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onMouseUp);
    draggingRef.current = false;
  };

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    dragPrevXRef.current = event.clientX;
    dragPrevYRef.current = event.clientY;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    let deltaFactor;
    switch (event.deltaMode) {
      case 0: // DOM_DELTA_PIXEL
        deltaFactor = 0.003;
        break;
      case 1: // DOM_DELTA_LINE
        deltaFactor = 0.1;
        break;
      default:
        // DOM_DELTA_PAGE
        deltaFactor = 1;
    }
    const newZoom = mapState.zoomLevel - event.deltaY * deltaFactor;
    setZoomLevel(
      newZoom,
      mapState.canvasDims.width,
      mapState.canvasDims.height,
    );
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.touches.length == 1) {
      const touch = event.touches[0];
      const x =
        divRef.current != null ? touch.clientX - divRef.current.offsetLeft : 0;
      const y =
        divRef.current != null ? touch.clientY - divRef.current.offsetTop : 0;
      dragPrevXRef.current = touch.clientX;
      dragPrevYRef.current = touch.clientY;
      const coord = transformPoint(mapState, {x, y});
      if (vectorField.pointInBounds(coord.lon, coord.lat)) {
        [cursorLonRef.current, cursorLatRef.current] = [coord.lon, coord.lat];
        setCursorData(
          coord.lon,
          coord.lat,
          vectorField.uField.getValue(coord.lon, coord.lat),
          vectorField.vField.getValue(coord.lon, coord.lat),
        );
      }
    } else {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      prevPinchZoomDistRef.current = Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
          Math.pow(t1.clientY - t2.clientY, 2),
      );
    }
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.touches.length == 1) {
      const touch = event.touches[0];
      moveMap(
        touch.clientX - dragPrevXRef.current,
        touch.clientY - dragPrevYRef.current,
        mapState.canvasDims.width,
        mapState.canvasDims.height,
      );
      dragPrevXRef.current = touch.clientX;
      dragPrevYRef.current = touch.clientY;
    } else {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      const pinchZoomDist = Math.sqrt(
        Math.pow(t1.clientX - t2.clientX, 2) +
          Math.pow(t1.clientY - t2.clientY, 2),
      );
      const newZoom =
        mapState.zoomLevel * (pinchZoomDist / prevPinchZoomDistRef.current);
      setZoomLevel(
        newZoom,
        mapState.canvasDims.width,
        mapState.canvasDims.height,
      );
      prevPinchZoomDistRef.current = pinchZoomDist;
    }
  };

  const onTouchEndOrCancel = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    [cursorLatRef.current, cursorLonRef.current] = [null, null];
    resetCursorData();
  };

  return (
    <div
      id="mouse-manager"
      ref={(div: HTMLDivElement) => {
        divRef.current = div;
      }}
      style={{
        position: 'fixed',
        width: width,
        height: height,
        cursor: draggingRef.current ? 'grabbing' : 'grab',
      }}
      onMouseMove={onMouseMove}
      onMouseOut={onMouseOut}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndOrCancel}
      onTouchCancel={onTouchEndOrCancel}
    />
  );
}
