import axios from 'axios';
import moment from 'moment';
import 'moment-timezone';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';
const METADATA_FILE = GFS_JSON_SERVER + '/metadata.json';

export async function getData(
  cycle: moment.Moment,
  tau: number,
): Promise<{u: Float32Array; v: Float32Array}> {
  const uResponse = await axios.get(dataFileUrl(cycle, tau, 'wind_u_sfc'));
  const vResponse = await axios.get(dataFileUrl(cycle, tau, 'wind_v_sfc'));
  // Convert JSON data to flat Float32Array
  const uData = new Float32Array(360 * 181);
  const vData = new Float32Array(360 * 181);
  for (let x = 0; x < 360; x++) {
    for (let y = 0; y < 181; y++) {
      uData[181 * x + y] = uResponse.data.data[x][y];
      vData[181 * x + y] = vResponse.data.data[x][y];
    }
  }
  return {u: uData, v: vData};
}

export async function getCycle(): Promise<moment.Moment> {
  const response = await axios.get(METADATA_FILE);
  return moment(response.data.run);
}

export async function getMaxWindSpeed(): Promise<number> {
  const response = await axios.get(METADATA_FILE);
  return response.data.maxWindSpeed;
}

function dataFileUrl(run: moment.Moment, tau: number, param: string) {
  return `${GFS_JSON_SERVER}/gfs_100_${run
    .tz('UTC')
    .format('YYYY-MM-DDTHH:mm:ssZ')}_${tau
    .toString()
    .padStart(3, '0')}_${param}.json`;
}
