'use strict';
import { gfsData } from './gfs'

export class WindField {
  uField: number[][];
  vField: number[][];

  constructor(uField: number[][], vField: number[][]) {
    this.uField = uField;
    this.vField = vField;
    if (
      uField.length !== vField.length ||
      uField[0].length !== vField[0].length
    ) {
      throw new Error('uField and vField must have the same dimensions');
    }
  }

  width(): number {
    return this.uField.length;
  }

  height(): number {
    return this.uField[0].length;
  }
}

function testField1(): WindField {
  const width = 25
  const height = 25;
  const uField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    uField.push([]);
    for (let y = 0; y <= height; y++) {
      if (x > y) {
        uField[x].push(0);
      } else {
        uField[x].push(1);
      }
    }
  }

  const vField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    vField.push([]);
    for (let y = 0; y <= height; y++) {
      if (x < y) {
        vField[x].push(0);
      } else {
        vField[x].push(1);
      }
    }
  }

  return new WindField(uField, vField);
}

function testField2(): WindField {
  const width = 25;
  const height = 25;
  const uField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    uField.push([]);
    for (let y = 0; y <= height; y++) {
      uField[x].push(Math.cos(y * 5) + Math.sin(x * 5) + 1);
    }
  }

  const vField: number[][] = [];
  for (let x = 0; x <= width; x++) {
    vField.push([]);
    for (let y = 0; y <= height; y++) {
      vField[x].push(Math.sin(x + 10));
    }
  }

  return new WindField(uField, vField);
}

function gfsField() {
  return new WindField(gfsData.u_data, gfsData.v_data);
}

export const WIND_FIELDS = {
  testField1: testField1(),
  testField2: testField2(),
  gfsField: gfsField(),
};
