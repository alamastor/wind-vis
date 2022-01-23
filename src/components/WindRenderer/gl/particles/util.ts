const PARTICLE_DENSITY = 0.01; // Particles per square pixel
export const MAX_PARTICLE_COUNT = 8000;
export const PARTICLE_FRAME_LIFETIME = 60;

export function getNumberOfParticlesToDraw(gl: WebGL2RenderingContext): number {
  return Math.min(
    PARTICLE_DENSITY * gl.canvas.width * gl.canvas.height,
    MAX_PARTICLE_COUNT,
  );
}
