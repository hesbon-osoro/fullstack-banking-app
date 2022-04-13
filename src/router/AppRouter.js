import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';

const AppRouter = () => {
	return (
		<Router>
			<div className="container">
				<Switch>
					<Route path="/" component={Login} exact={true} />
					<Route path="/register" component={Register} />
				</Switch>
			</div>
		</Router>
	);
};

const mapStateToProps = state => ({ auth: state.auth });

export default connect(mapStateToProps)(AppRouter);
