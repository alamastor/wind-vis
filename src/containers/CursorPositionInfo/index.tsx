/*
 * Component displaying information for current cursor position on map.
 */
import * as React from 'react';
import {connect} from 'react-redux';
import {style} from 'typestyle';

import {RootState} from '../../reducers';

const mainStyle = style({
  gridArea: '3 / 1',
  zIndex: 1,
  color: 'white',
  padding: '10px',
  marginTop: 'auto',
});

const mapStateToProps = (state: RootState) => ({
  lon: state.mapVis.cursorLon,
  lat: state.mapVis.cursorLat,
  u: state.mapVis.cursorU,
  v: state.mapVis.cursorV,
});

interface CursorPositionInfoProps {
  lon: number | null;
  lat: number | null;
  u: number | null;
  v: number | null;
}
function CursorPositionInfo({lon, lat, u, v}: CursorPositionInfoProps) {
  const latString = (): string => {
    if (lat != null) {
      if (lat < 0) {
        return `${Math.round(-lat)}S`;
      } else {
        return `${Math.round(lat)}N`;
      }
    } else {
      return '';
    }
  };

  const lonString = (): string => {
    if (lon != null) {
      if (lon < 180) {
        return `${Math.round(lon)}E`;
      } else {
        return `${Math.round(360 - lon)}W`;
      }
    } else {
      return '';
    }
  };

  const windSpeedString = (): string => {
    if (u != null && v != null) {
      return `${Math.round(Math.sqrt(u * u + v * v))}`;
    } else {
      return '';
    }
  };

  const windDirString = (): string => {
    if (u != null && v != null) {
      return `${(270 - Math.round((Math.atan2(v, u) * 180) / Math.PI)) % 360}`;
    } else {
      return '';
    }
  };

  return (
    <div id="cursor-position-info" className={mainStyle}>
      <div>
        {latString()} {lonString()}
      </div>
      <div>
        {windDirString()
          ? `${windDirString()}° / ${windSpeedString()} m/s`
          : ''}
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(CursorPositionInfo);
