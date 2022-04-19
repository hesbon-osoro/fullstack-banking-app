import { BASE_API_URL, SIGN_IN, SIGN_OUT } from '../utils/constants';
import { getErrors } from './errors';
import { history } from '../router/AppRouter';
import { initiateGetProfile } from './profile';
import { post } from '../utils/api';
import { resetAccount } from './account';

export const signIn = user => ({ type: SIGN_IN, user });

export const initiateLogin = (email, password) => {
	return async dispatch => {
		try {
			const result = await post(`${BASE_API_URL}/signin`, { email, password });
			const user = result.data;
			user.isAuthenticated = true;
			dispatch(signIn(user));
			dispatch(initiateGetProfile(user.email));
			history.push('/profile');
		} catch (e) {
			console.log(e);
			e.response && dispatch(getErrors(e.response.data));
		}
	};
};

export const registerNewUser = data => {
	return async dispatch => {
		try {
			await post(`${BASE_API_URL}/signup`, data);
			return { success: true };
		} catch (e) {
			console.log(`Register error: ${e}`);
			e.response && dispatch(getErrors(e.response.data));
			return { success: false };
		}
	};
};

export const signOut = () => ({ type: SIGN_OUT });

export const initiateLogout = () => {
	return async dispatch => {
		try {
			await post(`${BASE_API_URL}/logout`, dispatch(resetAccount()));
			return dispatch(signOut());
		} catch (e) {
			e.response && dispatch(getErrors(e.response.data));
		}
	};
};
