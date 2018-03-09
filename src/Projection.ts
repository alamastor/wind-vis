import VectorField from './utils/fielddata/VectorField';

export default class {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  constructor(
    minLon: number,
    maxLon: number,
    minLat: number,
    maxLat: number,
    width: number,
    height: number,
    zoom: number = 1,
    midLon: number = 40,
    midLat: number = 0,
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
    const midX = this.transformLon(midLon);
    const midY = this.transformLat(midLat);
    // TODO: Clean this up!!
    this.xOffset = width / 2 - midX + (width - this.width) / 2;
    this.yOffset = height / 2 - midY + (height - this.height) / 2;
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

  scaleX(x: number) {
    return x * (this.maxLon - this.minLon) / this.width;
  }

  transformX(x: number) {
    return (
      (x - this.xOffset) * (this.maxLon - this.minLon) / this.width +
      this.minLon
    );
  }

  scaleY(y: number) {
    return y * (this.maxLon - this.minLon) / this.width;
  }

  transformY(y: number) {
    return (
      (y - this.yOffset) * (this.minLat - this.maxLat) / this.height +
      this.maxLat
    );
  }
}
