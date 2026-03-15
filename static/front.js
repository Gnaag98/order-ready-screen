import { redrawPendingOrders, redrawCompletedOrders } from './common.js';

/** Fetches list of orders. */
function getOrders() {
	window.fetch('/orders')
	.then(response => handleResponse(response))
	.catch(error => console.error(error));
}

/** Redraws returned orders.
 * @param {Response} response
 * @returns {Promise<void>}
*/
function handleResponse(response) {
	return response.json()
		.then(json => {
			const pendingOrders = json['pending_orders'];
			const completedOrders = json['completed_orders'];
			redrawPendingOrders(pendingOrders);
			redrawCompletedOrders(completedOrders);
		});
}

// Fetch orders repeatedly, first on load.
window.addEventListener('load', () => {
	getOrders();
	window.setInterval(getOrders, 1000);
});
