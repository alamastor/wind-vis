import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import reducers from './reducers';

export const store = createStore(reducers);

import App from './containers/App';

if (navigator.userAgent.indexOf('Trident') !== -1) {
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
