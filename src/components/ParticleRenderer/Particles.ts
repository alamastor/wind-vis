import mod from '../../utils/mod';
import {ProjState} from '../../utils/Projection';
import VectorField from '../../utils/fielddata/VectorField';

export const PARTICLE_LIFETIME = 4000;
export const MAX_PARTICLE_COUNT = 100000;
export const MIN_PARTICLE_COUNT = 1000;

export interface Particles {
  readonly length: number;
  readonly lon: Float32Array;
  readonly lat: Float32Array;
  readonly age: Float32Array;
}

export function initParticles(count: number, lifetime: number): Particles {
  const result = {
    length: count,
    lon: new Float32Array(count),
    lat: new Float32Array(count),
    age: new Float32Array(count),
  };
  for (let i = 0; i < count; i++) {
    result.age[i] = Math.random() * lifetime;
  }
  return result;
}

export function updateParticles(
  particles: Particles,
  vectorField: VectorField,
  deltaT: number,
) {
  for (let i = 0; i < particles.length; i++) {
    const lon = particles.lon[i];
    const lat = particles.lat[i];
    const age = particles.age[i] + deltaT;
    if (age < PARTICLE_LIFETIME) {
      if (lat >= -90 && lat <= 90) {
        const u = vectorField.uField.getValue(lon, lat);
        const v = vectorField.vField.getValue(lon, lat);
        particles.lon[i] = mod(lon + u * deltaT / 1000, 360);
        particles.lat[i] = lat + v * deltaT / 1000;
      } else if (lat < -90) {
        const u = vectorField.uField.getValue(lon, -90);
        const v = vectorField.vField.getValue(lon, -90);
        particles.lon[i] = mod(180 + lon + u * deltaT / 1000, 360);
        particles.lat[i] = -90 - lat - v * deltaT / 1000;
      } else if (lat > 90) {
        const u = vectorField.uField.getValue(lon, 90);
        const v = vectorField.vField.getValue(lon, 90);
        particles.lon[i] = mod(180 + lon + u * deltaT / 1000, 360);
        particles.lat[i] = 90 - lat - v * deltaT / 1000;
      }
    } else {
      particles.lon[i] = Math.random() * 360;
      particles.lat[i] = Math.random() * 180 - 90;
    }
    particles.age[i] = age % PARTICLE_LIFETIME;
  }
}
