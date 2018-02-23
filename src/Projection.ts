import {VectorField} from './fields';

export default class {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  width: number;
  height: number;
  constructor(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    width: number,
    height: number,
  ) {
    [
      this.minLat,
      this.maxLat,
      this.minLon,
      this.maxLon,
      this.width,
      this.height,
    ] = [minLat, maxLat, minLon, maxLon, width, height];
  }

  scaleLat(lat: number) {
    return lat * (this.height / (this.maxLat - this.minLat));
  }

  transformLat(lat: number) {
    return this.height * (lat - this.maxLat) / (this.minLat - this.maxLat);
  }

  scaleLon(lon: number) {
    return lon * (this.width / (this.maxLon - this.minLon));
  }

  transformLon(lon: number) {
    return this.width * (lon - this.minLon) / (this.maxLon - this.minLon);
  }
}
