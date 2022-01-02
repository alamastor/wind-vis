const PARTICLE_DENSITY = 0.01; // Particles per square pixel
// Number of particles to be stored in texture, displayed particles will
// be subset of this.
export const MAX_PARTICLE_COUNT = 1000000;

export function getNumberOfParticlesToDraw(gl: WebGL2RenderingContext): number {
  return Math.min(
    PARTICLE_DENSITY * gl.canvas.width * gl.canvas.height,
    MAX_PARTICLE_COUNT,
  );
}
