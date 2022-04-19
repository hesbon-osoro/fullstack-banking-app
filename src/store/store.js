import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import authReducer from '../reducers/auth';
import accountReducer from '../reducers/account';
import profileReducer from '../reducers/profile';
import transactionsReducer from '../reducers/transactions';
import errorsReducer from '../reducers/errors';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
	combineReducers({
		auth: authReducer,
		account: accountReducer,
		profile: profileReducer,
		transactions: transactionsReducer,
		errors: errorsReducer,
	}),
	composeEnhancers(applyMiddleware(thunk))
);

export default store;
