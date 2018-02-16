import axios from 'axios';
import * as moment from 'moment';
import 'moment-timezone';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

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
      windField: new WindField(gfsData.uData, gfsData.vData),
    });
  }
  return Promise.resolve({
    cycle: cycle,
    data: data,
  });
}

async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return moment.tz(response.data.cycle, 'YYYYMMDD_HHmmss', 'UTC');
}

export interface TauData {
  dt: moment.Moment;
  windField: WindField;
}
export interface ModelData {
  cycle: moment.Moment;
  data: TauData[];
}

export const WIND_FIELDS = {
  testField1: testField1(),
  testField2: testField2(),
  gfsData: gfsData(),
};
