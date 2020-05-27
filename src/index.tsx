import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import reducers from './reducers';

export const store = createStore(reducers);

import App from './containers/App';
import('../rust_pkg/index.js').catch(console.error);

if (navigator.userAgent.indexOf('Trident') !== -1) {
  // IE not working due to lack of Object.assign, Promises and CSS grid. Should
  // all by polyfillable or fixable with prefixing in the case of grid.
  document.write(
    'Sorry, not available in Internet Explorer. Please try another browser.',
  );
} else {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
}
