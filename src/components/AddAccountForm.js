import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { validateFields } from '../utils/common';

const AddAccountForm = props => {
	const [state, setState] = useState({
		account_no: '',
		bank_name: '',
		ifsc: '',
		errorMsg: '',
	});
	useEffect(() => {
		setState({ errorMsg: props.errors });
	}, [props, props.errors]);

	const handleInputChange = e => {
		const { name, value } = e.target;
		setState({ [name]: value });
	};

	const handleAddAccount = e => {
		e.preventDefault();
		const { account_no, bank_name, ifsc } = state;
		const fieldsToValidate = [{ account_no }, { bank_name }, { ifsc }];
		const allFieldsEntered = validateFields(fieldsToValidate);

		if (!allFieldsEntered) {
			setState({ errorMsg: { add_error: 'Please enter all fields.' } });
		} else {
			props.handleAddAccount(state);
		}
	};

	const { account_no, bank_name, ifsc, errorMsg } = state;
	return (
		<div className="edit-account-form col-md-6 offset-md-3">
			<Form onSubmit={handleAddAccount} className="account-form">
				{errorMsg && errorMsg.add_error && (
					<p className="errorMsg centered-message">{errorMsg.add_error}</p>
				)}
				<Form.Group controlId="type">
					<Form.Label>Add account</Form.Label>
				</Form.Group>
				<hr />
				<Form.Group controlId="accnt_no">
					<Form.Label>Account number:</Form.Label>
					<Form.Control
						type="text"
						name="account_no"
						placeholder="Enter account number"
						value={account_no}
						onChange={handleInputChange}
					/>
				</Form.Group>
				<Form.Group controlId="bank_name">
					<Form.Label>Bank name:</Form.Label>
					<Form.Control
						type="text"
						name="bank_name"
						placeholder="Enter bank name"
						value={bank_name}
						onChange={handleInputChange}
					/>
				</Form.Group>
				<Form.Group controlId="ifsc">
					<Form.Label>IFSC Code:</Form.Label>
					<Form.Control
						type="text"
						name="ifsc"
						placeholder="Enter new IFSC Code"
						onChange={handleInputChange}
					/>
				</Form.Group>
				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>
		</div>
	);
};

const mapStateToProps = state => ({ errors: state.errors });

export default connect(mapStateToProps)(AddAccountForm);
