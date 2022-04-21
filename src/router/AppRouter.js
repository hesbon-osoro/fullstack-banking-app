import React from 'react';
import { connect } from 'react-redux';
import { Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import Login from '../components/Login';
import Register from '../components/Register';
import Logout from '../components/Logout';
import Account from '../components/Account';
import Profile from '../components/Profile';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

export const history = createBrowserHistory();

const AppRouter = () => (
	<Router history={history}>
		<div className="container">
			<Switch>
				<PublicRoute path="/" component={Login} exact={true} />
				<PublicRoute path="/register" component={Register} />
				<PrivateRoute path="/profile" component={Profile} />
				<PrivateRoute path="/account" component={Account} />
				<PrivateRoute path="/logout" component={Logout} />
			</Switch>
		</div>
	</Router>
);

export default connect()(AppRouter);
