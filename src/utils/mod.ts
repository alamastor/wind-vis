export default function mod(x: number, n: number) {
  return ((x % n) + n) % n;
}
