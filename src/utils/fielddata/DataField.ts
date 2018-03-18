export default class DataField {
  _data: number[][];
  _minLon: number;
  _maxLon: number;
  _minLat: number;
  _maxLat: number;
  resolution: number;

  constructor(
    data: number[][],
    minLon: number,
    maxLon: number,
    minLat: number,
    maxLat: number,
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
      this._minLon,
      this._maxLon,
      this._minLat,
      this._maxLat,
      this.resolution,
    ] = [data, minLon, maxLon, minLat, maxLat, resolution];
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

  pointInBounds(lon: number, lat: number) {
    return (
      lon >= this.getMinLon() &&
      lon <= this.getMaxLon() &&
      lat >= this.getMinLat() &&
      lat <= this.getMaxLat()
    );
  }

  getValue(lon: number, lat: number) {
    if (!this.pointInBounds(lon, lat)) {
      throw new Error(`point {lon: ${lon}, lat: ${lat}} out of bounds`);
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
