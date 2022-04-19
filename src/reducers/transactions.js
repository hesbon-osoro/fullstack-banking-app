import { ADD_TRANSACTION, SET_TRANSACTIONS } from '../utils/constants';

const transactionsReducer = (state = {}, action) => {
	switch (action.type) {
		case ADD_TRANSACTION:
			return [...state, action.transaction];
		case SET_TRANSACTIONS:
			return [...action.transactions];

		default:
			return state;
	}
};

export default transactionsReducer;
