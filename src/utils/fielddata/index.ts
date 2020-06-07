import axios from 'axios';
import * as moment from 'moment';
import 'moment-timezone';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';

export async function getData(
  cycle: moment.Moment,
  tau: number,
): Promise<{u: number[]; v: number[]}> {
  const gfsFileName = `gfs_100_${cycle
    .tz('UTC')
    .format('YYYYMMDD_HHmmss')}_${tau.toString().padStart(3, '0')}.json`;
  const response = await axios.get(`${GFS_JSON_SERVER}/${gfsFileName}`);
  const gfsData = response.data.gfsData;
  // Convert JSON data to flat array
  const uData = [];
  const vData = [];
  for (let x = 0; x < 360; x++) {
    for (let y = 0; y < 181; y++) {
      uData.push(gfsData.uData[x][y]);
      vData.push(gfsData.vData[x][y]);
    }
  }
  return {u: uData, v: vData};
}

export async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return moment.tz(response.data.cycle, 'YYYYMMDD_HHmmss', 'UTC');
}

export async function getMaxWindSpeed(): Promise<number> {
  const response = await axios.get(GFS_JSON_SERVER + '/cycle.json');
  return response.data.maxWindSpeed;
}
