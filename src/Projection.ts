import VectorField from './utils/fielddata/VectorField';

export default class {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  height: number;
  width: number;
  displayWidth: number;
  displayHeight: number;
  xOffset: number;
  yOffset: number;
  constructor(
    minLon: number,
    maxLon: number,
    minLat: number,
    maxLat: number,
    displayWidth: number,
    displayHeight: number,
    zoom: number = 1,
    midLon: number = 40,
    midLat: number = 0,
  ) {
    [
      this.minLat,
      this.maxLat,
      this.minLon,
      this.maxLon,
      this.displayWidth,
      this.displayHeight,
    ] = [minLat, maxLat, minLon, maxLon, displayWidth, displayHeight];
    if (this._widthLimited) {
      // width limited
      this.width = zoom * displayWidth;
      this.height = zoom * displayWidth / 2;
    } else {
      // height limited
      this.width = zoom * displayHeight * 2;
      this.height = zoom * displayHeight;
    }

    // Calculate offsets just based on area and zoom
    this.xOffset = (displayWidth - this.width) / 2;
    this.yOffset = (displayHeight - this.height) / 2;

    // Update offset to take mid position into account
    const midX = this.transformLon(midLon);
    const midY = this.transformLat(midLat);
    this.xOffset = displayWidth / 2 - midX + (displayWidth - this.width) / 2;
    this.yOffset = displayHeight / 2 - midY + (displayHeight - this.height) / 2;
  }

  _widthLimited() {
    const lonWidth = this.maxLon - this.minLon;
    const latHeight = this.maxLat - this.minLat;
    const ratio = lonWidth / latHeight;
    return this.displayWidth < this.displayHeight * ratio;
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
