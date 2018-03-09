const PIXELS_PER_DEGREE = 4;

export function degreesToPixels(degrees: number): number {
  return degrees * PIXELS_PER_DEGREE;
}
