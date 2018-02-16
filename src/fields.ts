import axios from 'axios';
import * as moment from 'moment';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

export class WindField {
  uField: number[][];
  vField: number[][];

  constructor(uField: number[][], vField: number[][]) { this.uField = uField; this.vField = vField;
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

async function testField1(): Promise<WindField> {
  const width = 25;
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

  return Promise.resolve(new WindField(uField, vField));
}

async function testField2(): Promise<WindField> {
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

  return Promise.resolve(new WindField(uField, vField));
}

async function gfsField() {
  const cycle = await getCycle();
  const gfsFileName = `gfs_100_${cycle.format('YYYYMMDD_HHmmss')}_000.json`;
  console.log(gfsFileName);
  const response = await axios.get(`${GFS_JSON_SERVER}/${gfsFileName}`);
  const gfsData = response.data.gfsData
  return Promise.resolve(new WindField(gfsData.uData, gfsData.vData));
}


async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + "/cycle.json");
  return moment(response.data.cycle, 'YYYYMMDD_HHmmss');
}


export const WIND_FIELDS = {
  testField1: testField1(),
  testField2: testField2(),
  gfsField: gfsField(),
};
