import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const Report = ({ transactions }) => {
	return (
		<div className="report-table">
			<BootstrapTable data={transactions} striped hover pagination>
				<TableHeaderColumn isKey dataFields="formatted_date">
					Date
				</TableHeaderColumn>
				<TableHeaderColumn isKey dataFields="deposit_amount">
					Deposits
				</TableHeaderColumn>
				<TableHeaderColumn isKey dataFields="withdraw_amount">
					Withdrawals
				</TableHeaderColumn>
				<TableHeaderColumn isKey dataFields="balance">
					Balance
				</TableHeaderColumn>
			</BootstrapTable>
		</div>
	);
};

export default Report;
