import { redrawPendingOrders } from './common.js'

let pendingOrders = [];

/** Redraws returned orders. */
function handleResponse(json) {
	pendingOrders = json['pending_orders'];
	redrawPendingOrders(pendingOrders);
}

/** Fetches list of orders. */
function list() {
	window.fetch('/list')
	.then(response => response.json())
	.then(json => {
		handleResponse(json);
	})
	.catch(error => console.error(error));
}

// Fetch orders repeatedly, first on load.
window.addEventListener('load', () => {
	list();
	window.setInterval(list, 1000);
});
