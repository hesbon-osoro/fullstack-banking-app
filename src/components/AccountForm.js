import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Button } from 'react-bootstrap';
import { validateFields } from '../utils/common';

class AccountForm extends Component {
	state = {
		amount: '',
		editAccount: false,
		account: {},
		ifsc: '',
		errorMsg: '',
	};
	handleUpdateAccount = ifsc => {
		const fieldsToUpdate = [{ ifsc }];

		const allFieldsEntered = validateFields(fieldsToUpdate);

		if (!allFieldsEntered) {
			this.setState({ errorMsg: { update_error: 'Please enter ifsc code.' } });
		} else {
			this.setState({ errorMsg: '' });
		}
	};
	handleAmountChange = e => {
		this.setState({ amount: e.target.value });
	};
	handleEditAccount = e => {
		e.preventDefault();
		this.setState(prevState => ({ editAccount: !prevState.editAccount }));
	};
	handleInputChange = e => {
		this.setState({ ifsc: e.target.value });
	};
	render() {
		const { selectedType } = this.props;
		const { editAccount, ifsc, errorMsg, account = '' } = this.state;
		const account_no = account.account_no ? account.account_no : '';
		const type = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);

		return editAccount ? (
			<div className="edit-account col-md-6 offset-md-3">
				<h3>
					Account details
					<a
						href="/#"
						className="edit-account"
						onClick={this.handleEditAccount}
					>
						Go Back
					</a>
				</h3>
				<hr />
				<Form>
					{errorMsg && errorMsg.update_error && (
						<p className="errorMsg">{errorMsg.update_error}</p>
					)}
					<Form.Group controlId="acc_no">
						<Form.Label>Account number:</Form.Label>
						<span className="label-value">{account && account_no}</span>
					</Form.Group>
					<Form.Group controlId="bank_name">
						<Form.Label>Bank name:</Form.Label>
						<span className="label-value">{account && account.bank_name}</span>
					</Form.Group>
					<Form.Group controlId="ifsc">
						<Form.Label>IFSC code:</Form.Label>
						<span className="label-value">{account && account.ifsc}</span>
						<Form.Control
							type="text"
							placeholder="Enter new IFSC code"
							value={ifsc}
							onChange={this.handleInputChange}
						/>
					</Form.Group>
					<Button
						variant="primary"
						onClick={() => this.handleUpdateAccount(ifsc)}
					>
						Update details
					</Button>
				</Form>
			</div>
		) : (
			<div className="account-form col-md-6 offset-md-3">
				{errorMsg && errorMsg.withdraw_error && (
					<p className="errorMsg">{errorMsg.withdraw_error}</p>
				)}
				{errorMsg && errorMsg.add_error && (
					<p className="errorMsg">{errorMsg.add_error}</p>
				)}
				<Form onSubmit={this.handleOnSubmit} className="account-form">
					<Form.Group controlId="type">
						<Form.Label>{type}</Form.Label>
						<a
							href="/#"
							className="edit-account"
							onClick={this.handleEditAccount}
						>
							Edit Account Details
						</a>
					</Form.Group>
					<hr />
					<Form.Group controlId="accnt_no">
						<Form.Label>Account Number:</Form.Label>
						<span className="label-value">{account && account_no}</span>
					</Form.Group>
					<Form.Group controlId="accnt_no">
						<Form.Label>Available balance:</Form.Label>
						<span className="label-value">
							{account && account.total_balance}
						</span>
					</Form.Group>
					<Form.Group controlId="amount">
						<Form.Label>Amount:</Form.Label>
						<Form.Control
							type="number"
							placeholder={`Enter amount to ${selectedType}`}
							value={this.state.amount}
							onChange={this.handleAmountChange}
						/>
					</Form.Group>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</Form>
			</div>
		);
	}
}

export default connect()(AccountForm);
