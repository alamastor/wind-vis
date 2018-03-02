import axios from 'axios';
import * as moment from 'moment';
import 'moment-timezone';

import {store} from '../../index';
import DataField from './DataField';
import VectorField from './VectorField';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

export async function getData(
  cycle: moment.Moment,
  tau: number,
): Promise<{u: number[][]; v: number[][]}> {
  const gfsFileName = `gfs_100_${cycle
    .tz('UTC')
    .format('YYYYMMDD_HHmmss')}_${tau.toString().padStart(3, '0')}.json`;
  const response = await axios.get(`${GFS_JSON_SERVER}/${gfsFileName}`);
  const gfsData = response.data.gfsData;
  return {u: gfsData.uData, v: gfsData.vData};
}

export async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return moment.tz(response.data.cycle, 'YYYYMMDD_HHmmss', 'UTC');
}
