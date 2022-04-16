import jwt_decode from 'jwt-decode';
import store from '../store/store';
import { initiateGetProfile } from '../actions/profile';
import { signIn } from '../actions/auth';
import { history } from '../router/AppRouter';
import Axios from 'axios';

export const validateFields = fieldsToValidate => {
	return fieldsToValidate.every(field => Object.values(field)[0] !== '');
};

export const maintainSession = () => {
	const currentPath = window.location.pathname;

	if (currentPath === '/profile') {
		store.dispatch(initiateGetProfile());
	}
};

export const updateStore = user => {
	const { userid, email } = user;
	store.dispatch(
		signIn({
			userid,
			email,
			token: localStorage.getItem('user_token'),
		})
	);
	store.dispatch(initiateGetProfile(email));
};

export const setAuthHeader = () => {
	const token = localStorage.getItem('user_token');
	if (token) {
		Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}
};

export const removeAuthHeader = () => {
	delete Axios.defaults.headers.common['Authorization'];
};
