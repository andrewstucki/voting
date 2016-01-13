import React from 'react';
import ReactDOM from 'react';
// import { Dispatcher } from 'flux';
import { createHistory } from 'history';
import Root from './root';

const history = createHistory();
const application = document.getElementById('app');

ReactDOM.render(<Root history={history} />, application);

if (process.env.NODE_ENV !== "production") console.log("test");
