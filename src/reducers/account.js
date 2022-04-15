import { RESET_ACCOUNT, SET_ACCOUNT, UPDATE_ACCOUNT } from '../utils/constants';

const accountReducer = (state = {}, action) => {
	switch (action.type) {
		case SET_ACCOUNT:
			return {
				...action.accountDetails.account,
			};
		case RESET_ACCOUNT:
			return {};
		case UPDATE_ACCOUNT:
			if (action.operation === 'withdraw') {
				return {
					...state,
					total_balance: +state.total_balance - +action.amountToChange,
				};
			} else if (action.operation === 'deposit') {
				return {
					...state,
					total_balance: +state.total_balance + +action.amountToChange,
				};
			}
			break;
		default:
			return state;
	}
};

export default accountReducer;
