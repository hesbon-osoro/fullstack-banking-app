import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router/AppRouter';
import { Provider } from 'react-redux';
import store from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/main.scss';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
	<Provider store={store}>
		<AppRouter />
	</Provider>
);
