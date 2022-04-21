import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { resetErrors } from '../actions/errors';
import { validateFields } from '../utils/common';
import { registerNewUser } from '../actions/auth';

const Register = props => {
	const [state, setState] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
		cpassword: '',
	});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
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

	const registerUser = e => {
		e.preventDefault();
		const { first_name, last_name, email, password, cpassword } = state;
		const fieldsToValidate = [
			{ first_name },
			{ last_name },
			{ email },
			{ password },
			{ cpassword },
		];
		const allFieldsEntered = validateFields(fieldsToValidate);
		if (!allFieldsEntered) {
			setErrorMsg({ signup_error: 'Please enter all fields.' });
		} else {
			if (password !== cpassword) {
				setErrorMsg({
					signup_error: 'Password and confirm password do not match.',
				});
			} else {
				setIsSubmitted(true);
				props.dispatch(
					registerNewUser({ first_name, last_name, email, password }).then(
						() => res => {
							if (res.success) {
								setSuccessMsg('User registered successfully.');
								setErrorMsg('');
							}
						}
					)
				);
			}
		}
	};
	const handleInputChange = e => {
		const { name, value } = e.target;
		setState({ ...state, [name]: value });
	};
	return (
		<div className="login-page">
			<h2>Register User</h2>
			<div className="login-form">
				<Form onSubmit={registerUser}>
					{errorMsg && errorMsg.signup_error ? (
						<p className="errorMsg centered-message">{errorMsg.signup_error}</p>
					) : (
						isSubmitted && (
							<p className="successMsg centered-message">{successMsg}</p>
						)
					)}
					<Form.Group controlId="first_name">
						<Form.Label>First name</Form.Label>
						<Form.Control
							type="text"
							name="first_name"
							value={state.first_name}
							placeholder="First name"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<Form.Group controlId="last_name">
						<Form.Label>Last name</Form.Label>
						<Form.Control
							type="text"
							name="last_name"
							value={state.last_name}
							placeholder="Last name"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<Form.Group controlId="email">
						<Form.Label>Email address</Form.Label>
						<Form.Control
							type="email"
							name="email"
							value={state.email}
							placeholder="Email address"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<Form.Group controlId="password">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							name="password"
							value={state.password}
							placeholder="Password"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<Form.Group controlId="cpassword">
						<Form.Label>Confirm password</Form.Label>
						<Form.Control
							type="password"
							name="cpassword"
							value={state.cpassword}
							placeholder="Confirm password"
							onChange={handleInputChange}
						/>
					</Form.Group>
					<div className="action-items">
						<Button variant="primary" type="submit">
							Register
						</Button>
						<Link to="/" className="btn btn-secondary">
							Login
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

export default connect(mapStateToProps)(Register);
