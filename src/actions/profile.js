import { BASE_API_URL, UPDATE_PROFILE } from '../utils/constants';
import { get, post } from '../utils/api';
import { getErrors } from './errors';

export const updateProfile = profile => ({ type: UPDATE_PROFILE, profile });

export const initiateUpdateProfile = profileData => {
	return async dispatch => {
		try {
			const profile = await post(`${BASE_API_URL}/profile`, profileData);
			dispatch(updateProfile(profile.data));
		} catch (e) {
			e.response && dispatch(getErrors(e.response.data));
		}
	};
};

export const initiateGetProfile = () => {
	return async dispatch => {
		try {
			const profile = await get(`${BASE_API_URL}/profile/`);
			dispatch(updateProfile(profile.data));
		} catch (e) {
			e.response && dispatch(getErrors(e.response.data));
		}
	};
};
