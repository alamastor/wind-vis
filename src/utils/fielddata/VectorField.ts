import DataField from './DataField';

export default class VectorField {
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

  pointInBounds(lon: number, lat: number): boolean {
    return this.uField.pointInBounds(lon, lat);
  }

  speedData(): Float32Array {
    const result = new Float32Array(this.uField.data.length);
    for (let i = 0; i < result.length; i++) {
      result[i] = Math.sqrt(
        this.uField.data[i] ** 2 + this.vField.data[i] ** 2,
      );
    }
    return result;
  }
}
