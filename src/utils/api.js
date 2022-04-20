import axios from 'axios';
import store from '../store/store';
import { signIn } from '../actions/auth';
import { addCSRFToken } from './common';

export const get = async (url, params) => {
	try {
		const token = await getCSRFToken();
		axios.defaults.headers['X-CSRF-TOken'] = token;
		const result = await axios.get(url, params);
		store.dispatch(signIn({ isAuthenticated: true }));
		return result;
	} catch (e) {
		console.log(e);
	}
};

export const post = async (url, params) => {
	try {
		const token = await addCSRFToken();
		axios.defaults.headers['X-CSRF-Token'] = token;
		const result = await axios.post(url, params);
		store.dispatch(signIn({ isAuthenticated: true }));
		return result;
	} catch (e) {
		console.log(e);
	}
};

export const patch = async (url, params) => {
	try {
		const token = await addCSRFToken();
		axios.defaults.headers['X-CSRF-Token'] = token;
		const result = await axios.patch(url, params);
		store.dispatch(signIn({ isAuthenticated: true }));
		return result;
	} catch (e) {
		console.log(e);
	}
};