import axios from 'axios';
import * as moment from 'moment';
import 'moment-timezone';

import {Degree} from '../units';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

export class VectorField {
  uField: DataField;
  vField: DataField;

  constructor(uField: DataField, vField: DataField) {
    [this.uField, this.vField] = [uField, vField];
    if (
      uField.getMinLat() !== vField.getMinLat() ||
      uField.getMaxLat() !== vField.getMaxLat() ||
      uField.getMinLon() !== vField.getMinLon() ||
      uField.getMaxLon() !== vField.getMaxLon() ||
      uField.resolution !== vField.resolution
    ) {
      throw new Error('Vector field dimensions must match.');
    }
  }

  getMinLat(): number {
    return this.uField.getMinLat();
  }

  getMaxLat(): number {
    return this.uField.getMaxLat();
  }

  getMinLon(): number {
    return this.uField.getMinLon();
  }

  getMaxLon(): number {
    return this.uField.getMaxLon();
  }
}

export class DataField {
  _data: number[][];
  _minLat: number;
  _maxLat: number;
  _minLon: number;
  _maxLon: number;
  resolution: number;

  constructor(
    data: number[][],
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    resolution: number,
  ) {
    const dataHeight = data[0].length;
    if (!data.every((row: number[]) => row.length === dataHeight)) {
      throw new Error('data field is not rectangular');
    }
    if (resolution !== 1) {
      // Currently only 1 degrees resolution supported
      throw new Error('resolution must be 1 degree');
    }
    [
      this._data,
      this._minLat,
      this._maxLat,
      this._minLon,
      this._maxLon,
      this.resolution,
    ] = [data, minLat, maxLat, minLon, maxLon, resolution];
  }

  lonWrap(): boolean {
    return this._minLon === (this._maxLon + this.resolution) % 360;
  }

  getMinLat(): number {
    return this._minLat;
  }

  getMaxLat(): number {
    return this._maxLat;
  }

  getMinLon(): number {
    if (this.lonWrap()) {
      return 0;
    } else {
      return this._minLon;
    }
  }

  getMaxLon(): number {
    if (this.lonWrap()) {
      return 360;
    } else {
      return this._maxLon;
    }
  }

  _getDataWidth() {
    return this._data.length;
  }

  _getDataHeight() {
    return this._data[0].length;
  }

  getValue(lat: number, lon: number) {
    if (
      lat < this.getMinLat() ||
      lat > this.getMaxLat() ||
      lon < this.getMinLon() ||
      lon > this.getMaxLon()
    ) {
      throw new Error('point out of bounds');
    }
    const x =
      (this._getDataWidth() - 1) *
      (lon - this._minLon) /
      (this._maxLon - this._minLon);
    const y =
      (this._getDataHeight() - 1) *
      (lat - this._minLat) /
      (this._maxLat - this._minLat);
    return this._interpolatePoint(x, y);
  }

  _interpolatePoint(x: number, y: number): number {
    const ulPoint = this._data[this._wrapXVal(Math.floor(x))][Math.ceil(y)];
    const urPoint = this._data[this._wrapXVal(Math.ceil(x))][Math.ceil(y)];
    const lrPoint = this._data[this._wrapXVal(Math.ceil(x))][Math.floor(y)];
    const llPoint = this._data[this._wrapXVal(Math.floor(x))][Math.floor(y)];

    const uPoint = this._linearInterp(x - Math.floor(x), ulPoint, urPoint);
    const lPoint = this._linearInterp(x - Math.floor(x), llPoint, lrPoint);

    return this._linearInterp(y - Math.floor(y), lPoint, uPoint);
  }

  _linearInterp(x: number, y1: number, y2: number) {
    return x * (y2 - y1) + y1;
  }

  _wrapXVal(val: number): number {
    return this.lonWrap() && val === this._getDataWidth() ? 0 : val;
  }
}

async function gfsData(): Promise<ModelData> {
  const cycle = await getCycle();

  const data = [];
  for (let tau = 0; tau < 183; tau = tau + 3) {
    const gfsFileName = `gfs_100_${cycle.format(
      'YYYYMMDD_HHmmss',
    )}_${tau.toString().padStart(3, '0')}.json`;
    const response = await axios.get(`${GFS_JSON_SERVER}/${gfsFileName}`);
    const gfsData = response.data.gfsData;
    const forecastTime = moment(cycle);
    forecastTime.add(tau, 'hours');
    data.push({
      dt: forecastTime,
      vectorField: new VectorField(
        new DataField(gfsData.uData, -90, 90, 0, 359, 1),
        new DataField(gfsData.vData, -90, 90, 0, 359, 1),
      ),
    });
  }
  return Promise.resolve(new ModelData(cycle, data));
}

async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return moment.tz(response.data.cycle, 'YYYYMMDD_HHmmss', 'UTC');
}

export interface TauData {
  dt: moment.Moment;
  vectorField: VectorField;
}
export class ModelData {
  cycle: moment.Moment;
  data: TauData[];

  constructor(cycle: moment.Moment, data: TauData[]) {
    this.cycle = cycle;
    this.data = data;
  }

  getLatDegrees() {
    const minLat = this.data[0].vectorField.uField.getMinLat();
    const maxLat = this.data[0].vectorField.uField.getMaxLat();
    return maxLat - minLat;
  }

  getLonDegrees() {
    if (this.data[0].vectorField.uField.lonWrap()) {
      return 360;
    } else {
      const minLon = this.data[0].vectorField.uField.getMinLon();
      const maxLon = this.data[0].vectorField.uField.getMaxLon();
      return maxLon - minLon;
    }
  }
}

export const WIND_FIELDS = {
  gfsData: gfsData(),
};
