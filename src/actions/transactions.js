import {
	BASE_API_URL,
	ADD_TRANSACTION,
	SET_TRANSACTIONS,
} from '../utils/constants';
import { getErrors } from './errors';
import { updateAccountBalance } from './account';
import { get, post } from '../utils/api';
import download from 'downloadjs';

export const addTransaction = transaction => ({
	type: ADD_TRANSACTION,
	transaction,
});

export const initiateDepositAmount = (account_id, amount) => {
	return async dispatch => {
		try {
			const transaction = {
				transaction_date: new Date(),
				deposit_amount: amount,
			};
			await post(`${BASE_API_URL}/deposit/${account_id}`, transaction);
			dispatch(addTransaction({ ...transaction, withdraw_amount: null }));
			dispatch(updateAccountBalance(amount, 'deposit'));
		} catch (error) {
			error.response && dispatch(getErrors(error.response.data));
		}
	};
};

export const initiateWithdrawAmount = (account_id, amount) => {
	return async dispatch => {
		try {
			const transaction = {
				transaction_date: new Date(),
				withdraw_amount: amount,
			};
			await post(`${BASE_API_URL}/withdraw/${account_id}`, transaction);
			dispatch(addTransaction({ ...transaction, deposit_amount: null }));
			dispatch(updateAccountBalance(amount, 'withdraw'));
		} catch (error) {
			error.response && dispatch(getErrors(error.response.data));
		}
	};
};

export const setTransactions = transactions => ({
	type: SET_TRANSACTIONS,
	transactions,
});

export const initiateGetTransactions = (
	account_id,
	start_date,
	end_date,
	pagination
) => {
	return async dispatch => {
		try {
			let query;
			if (start_date && end_date) {
				query = `${BASE_API_URL}/transactions/${account_id}?start_date=${start_date}&end_date=${end_date}`;
			} else {
				query = `${BASE_API_URL}/transactions/${account_id}`;
			}
			if (pagination) {
				const separator = query.includes('?') ? '&' : '?';
				query += `${separator}page=${pagination.page}&limit=${pagination.limit}`;
			}
			const profile = await get(query);
			// A paginated response is { data, pagination }; an unpaginated
			// one is still a bare array, so both shapes are accepted.
			if (pagination) {
				dispatch(setTransactions(profile.data.data));
				return profile.data.pagination;
			}
			dispatch(setTransactions(profile.data));
			return null;
		} catch (error) {
			error.response && dispatch(getErrors(error.response.data));
			return null;
		}
	};
};

export const downloadReport = (account_id, start_date, end_date) => {
	return async dispatch => {
		try {
			const result = await get(
				`${BASE_API_URL}/download/${account_id}?start_date=${start_date}&end_date=${end_date}}`,
				{ responseType: 'blob' }
			);
			return download(result.data, 'transactions.pdf', 'application/pdf');
		} catch (error) {
			if (error.response && error.response.status === 400) {
				dispatch(
					getErrors({
						transactions_error: 'Error while downloading...Try again later.',
					})
				);
			}
		}
	};
};
