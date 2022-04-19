import store from '../store/store';
import axios from 'axios';
import { BASE_API_URL } from './constants';
import { initiateGetProfile } from '../actions/profile';

export const validateFields = fieldsToValidate =>
	fieldsToValidate.every(field => Object.keys(field)[0] !== '');

export const maintainSession = () => {
	if (window.location.pathname === '/profile') {
		store.dispatch(initiateGetProfile);
	}
};

export const addCSRFToken = async () => {
	try {
		const result = await axios.get(`${BASE_API_URL}/csrf-token`);
		return result.data.csrfToken;
	} catch (e) {
		console.log(e);
	}
};
