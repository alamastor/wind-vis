import * as React from 'react';
import {Dispatch, connect} from 'react-redux';

import {RootState} from '../../reducers';

const mapStateToProps = (state: RootState) => ({
  lat: state.mapVis.lat,
  lon: state.mapVis.lon,
  u: state.mapVis.u,
  v: state.mapVis.v,
});

interface Props {
  lat: number | null;
  lon: number | null;
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

  infoString(): string {
    return `lat: ${this.latString()}
            lon: ${this.lonString()}
            wind speed: ${this.windSpeedString()}
            wind dir: ${this.windDirString()}`;
  }

  render() {
    return <div id="cursor-position-info">{this.infoString()}</div>;
  }
}

export default connect(mapStateToProps)(CursorPositionInfo);
