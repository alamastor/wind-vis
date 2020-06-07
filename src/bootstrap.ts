//Top level async import, this is required for Webpack to load wasm
import('./index').catch((e) => console.error('Error importing `index.js`:', e));
