import axios from 'axios';
import {DateTime} from 'luxon';

const GFS_JSON_SERVER = 'https://wind-vis-data.alamastor.me';
const METADATA_FILE = GFS_JSON_SERVER + '/metadata.json';

export async function getData(
  run: DateTime,
  tau: number,
): Promise<{u: Float32Array; v: Float32Array}> {
  const uResponse = await axios.get(dataFileUrl(run, tau, 'wind_u_sfc'));
  const vResponse = await axios.get(dataFileUrl(run, tau, 'wind_v_sfc'));
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

export async function getCycle(): Promise<DateTime> {
  const response = await axios.get(METADATA_FILE);
  return DateTime.fromISO(response.data.run, {setZone: true});
}

export async function getMaxWindSpeed(): Promise<number> {
  const response = await axios.get(METADATA_FILE);
  return response.data.maxWindSpeed;
}

function dataFileUrl(run: DateTime, tau: number, param: string) {
  return `${GFS_JSON_SERVER}/gfs_100_${run.toFormat(
    "yyyy-MM-dd'T'HH:mm:ssZZ",
  )}_${tau.toString().padStart(3, '0')}_${param}.json`;
}
