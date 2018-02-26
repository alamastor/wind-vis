import {VectorField} from './fields';

export default class {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  constructor(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    width: number,
    height: number,
    zoom: number = 1,
  ) {
    [this.minLat, this.maxLat, this.minLon, this.maxLon] = [
      minLat,
      maxLat,
      minLon,
      maxLon,
    ];
    if (width < height * 2) {
      // width limited
      this.width = zoom * width;
      this.height = zoom * width / 2;
    } else {
      // height limited
      this.width = zoom * height * 2;
      this.height = zoom * height;
    }
    this.xOffset = (width - this.width) / 2;
    this.yOffset = (height - this.height) / 2;
  }

  scaleLat(lat: number) {
    return lat * (this.height / (this.maxLat - this.minLat));
  }

  transformLat(lat: number) {
    return (
      this.height * (lat - this.maxLat) / (this.minLat - this.maxLat) +
      this.yOffset
    );
  }

  scaleLon(lon: number) {
    return lon * (this.width / (this.maxLon - this.minLon));
  }

  transformLon(lon: number) {
    return (
      this.width * (lon - this.minLon) / (this.maxLon - this.minLon) +
      this.xOffset
    );
  }

  transformX(x: number) {
    return (
      (x - this.xOffset) * (this.maxLon - this.minLon) / this.width +
      this.minLon
    );
  }

  transformY(y: number) {
    return (
      (y - this.yOffset) * (this.minLat - this.maxLat) / this.height +
      this.maxLat
    );
  }
}
