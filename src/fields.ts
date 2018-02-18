import axios from 'axios';
import * as moment from 'moment';
import 'moment-timezone';

import {Degree} from './units';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

export class VectorField {
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

  getWidth(): number {
    return this.uField.length;
  }

  getHeight(): number {
    return this.uField[0].length;
  }
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
      vectorField: new VectorField(gfsData.uData, gfsData.vData),
    });
  }
  return Promise.resolve(new ModelData(cycle, data, 1, 1));
}

async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return moment.tz(response.data.cycle, 'YYYYMMDD_HHmmss', 'UTC');
}

export interface TauData {
  dt: moment.Moment;
  vectorField: VectorField;
}
export class ModelData {
  cycle: moment.Moment;
  data: TauData[];
  uResolution: Degree;
  vResolution: Degree;

  constructor(
    cycle: moment.Moment,
    data: TauData[],
    uResolution: Degree,
    vResolution: Degree,
  ) {
    this.cycle = cycle;
    this.data = data;
    this.uResolution = uResolution;
    this.vResolution = vResolution;
  }

  getLatDegrees() {
    return this.data[0].vectorField.getHeight() * this.vResolution;
  }

  getLonDegrees() {
    return this.data[0].vectorField.getWidth() * this.uResolution;
  }
}

export const WIND_FIELDS = {
  gfsData: gfsData(),
};
