import React from 'react';
import { Switch, Router } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Profile from '../components/Profile';
import { createBrowserHistory } from 'history';
import Logout from '../components/Logout';
import Account from '../components/Account';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

export const history = createBrowserHistory();

const AppRouter = () => {
	return (
		<Router history={history}>
			<div className="container">
				<Switch>
					<PublicRoute path="/" component={Login} exact={true} />
					<PublicRoute path="/register" component={Register} />
					<PrivateRoute path="/profile" component={Profile} />
					<PrivateRoute path="/logout" component={Logout} />
					<PrivateRoute path="/account" component={Account} />
				</Switch>
			</div>
		</Router>
	);
};

export default AppRouter;
