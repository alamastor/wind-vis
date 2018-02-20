import {VectorField} from './fields';

export default class {
  vectorField: VectorField;
  width: number;
  height: number;
  constructor(vectorField: VectorField, width: number, height: number) {
    this.vectorField = vectorField;
    this.width = width;
    this.height = height;
  }
  scaleX(xUnits: number) {
    return xUnits * (this.width / this.vectorField.getWidth());
  }

  transformX(x: number) {
    return this.scaleX(x);
  }

  scaleY(yUnits: number) {
    return yUnits * (this.height / (this.vectorField.getHeight() - 1));
  }

  transformY(y: number) {
    return this.height - this.scaleY(y);
  }
}
