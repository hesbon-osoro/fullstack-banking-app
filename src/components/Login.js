import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { initiateLogin } from '../actions/auth';
import { resetErrors } from '../actions/errors';
import { validateFields } from '../utils/common';

const Login = props => {
	const [state, setState] = useState({ email: '', password: '' });
	const [errorMsg, setErrorMsg] = useState('');

	const processOnMount = useCallback(() => {
		return () => props.dispatch(resetErrors());
	}, [props]);

	useEffect(() => {
		processOnMount();
	}, [processOnMount]);

	useEffect(() => {
		setErrorMsg(props.errors);
	}, [props, props.errors]);

	const handleLogin = e => {
		e.preventDefault();
		const { email, password } = state;
		const fieldsToValidate = [{ email }, { password }];

		const allFieldsEntered = validateFields(fieldsToValidate);

		if (!allFieldsEntered) {
			setErrorMsg({
				errorMsg: { signin_error: 'Please enter all the fields.' },
			});
		} else {
			setErrorMsg({ errorMsg: { signin_error: '' } });
			props.dispatch(initiateLogin(email, password));
		}
	};
	const handleInputChange = e => {
		const { name, value } = e.target;
		setState({ ...state, [name]: value });
	};
	return (
		<div className="login-page">
			<h1>Banking Application</h1>
			<div className="login-form">
				<Form onSubmit={handleLogin}>
					{errorMsg && errorMsg.signin_error && (
						<p className="errorMsg centered-message">{errorMsg.signin_error}</p>
					)}
					<Form.Group controlId="email">
						<Form.Label>Email address</Form.Label>
						<Form.Control
							type="email"
							name="email"
							placeholder="Email address"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<Form.Group controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							name="password"
							placeholder="Enter Password"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<div className="action-items">
						<Button variant="primary" type="submit">
							Login
						</Button>
						<Link to="/register" className="btn btn-secondary">
							Create Account
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
};

const mapStateToProps = state => ({
	errors: state.errors,
});

export default connect(mapStateToProps)(Login);
