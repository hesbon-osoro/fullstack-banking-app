import React from 'react';
import { Button } from 'react-bootstrap';

/**
 * Controls for moving between pages of transaction history.
 *
 * The parent owns the current page; this component only reports intent.
 * Buttons are disabled at the boundaries so an out-of-range request cannot
 * be issued from the UI.
 */
const TransactionPagination = ({ pagination, onPageChange, isLoading }) => {
	if (!pagination) return null;

	const {
		current_page: currentPage,
		total_pages: totalPages,
		total,
		per_page: perPage,
	} = pagination;

	const canGoPrevious = currentPage > 1 && !isLoading;
	const canGoNext = currentPage < totalPages && !isLoading;

	return (
		<div className="transaction-pagination">
			<Button
				variant="primary"
				type="button"
				disabled={!canGoPrevious}
				onClick={() => onPageChange(currentPage - 1)}
			>
				Previous
			</Button>
			<span className="pagination-status">
				Page {currentPage} of {totalPages} &middot; {total} transactions
				{perPage ? ` (${perPage} per page)` : ''}
			</span>
			<Button
				variant="primary"
				type="button"
				disabled={!canGoNext}
				onClick={() => onPageChange(currentPage + 1)}
			>
				Next
			</Button>
		</div>
	);
};

export default TransactionPagination;
