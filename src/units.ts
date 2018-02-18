const PIXELS_PER_DEGREE = 4;

export type Degree = number;

export function degreesToPixels(degrees: Degree): number {
  return degrees * PIXELS_PER_DEGREE;
}
