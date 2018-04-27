/*
 * Component displaying information for current cursor position on map.
*/
import * as React from 'react';
import {Dispatch, connect} from 'react-redux';
import {style} from 'typestyle';

import {RootState} from '../../reducers';

const mapStateToProps = (state: RootState) => ({
  lon: state.mapVis.cursorLon,
  lat: state.mapVis.cursorLat,
  u: state.mapVis.cursorU,
  v: state.mapVis.cursorV,
});

interface Props {
  lon: number | null;
  lat: number | null;
  u: number | null;
  v: number | null;
}
interface State {}

class CursorPositionInfo extends React.Component<Props, State> {
  latString(): string {
    if (this.props.lat != null) {
      if (this.props.lat < 0) {
        return `${Math.round(-this.props.lat)}S`;
      } else {
        return `${Math.round(this.props.lat)}N`;
      }
    } else {
      return '';
    }
  }

  lonString(): string {
    if (this.props.lon != null) {
      if (this.props.lon < 180) {
        return `${Math.round(this.props.lon)}E`;
      } else {
        return `${Math.round(360 - this.props.lon)}W`;
      }
    } else {
      return '';
    }
  }

  windSpeedString(): string {
    if (this.props.u != null && this.props.v != null) {
      return `${Math.round(
        Math.sqrt(this.props.u * this.props.u + this.props.v * this.props.v),
      )}`;
    } else {
      return '';
    }
  }

  windDirString(): string {
    if (this.props.u != null && this.props.v != null) {
      return `${(270 -
        Math.round(Math.atan2(this.props.v, this.props.u) * 180 / Math.PI)) %
        360}`;
    } else {
      return '';
    }
  }

  render() {
    return (
      <div
        id="cursor-position-info"
        className={style({
          gridArea: '3 / 1',
          zIndex: 1,
          color: 'white',
          padding: '10px',
          marginTop: 'auto',
        })}>
        <div>
          {this.latString()} {this.lonString()}
        </div>
        <div>
          {this.windDirString()
            ? `${this.windDirString()}° / ${this.windSpeedString()} m/s`
            : ''}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(CursorPositionInfo);
