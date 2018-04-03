export default function debugLog(...args: Object[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}
