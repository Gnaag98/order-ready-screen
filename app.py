from flask import Flask, render_template, request

app = Flask(__name__)

HTTP_STATUS_RESET_CONTENT = 205
""" Prompts the client to refresh the page or fetch new data. """
HTTP_STATUS_NOT_FOUND = 404

# Order IDs are used as keys to allow for duplicate order numbers.
pending_orders: dict[int, int] = {}
completed_orders: dict[int, int] = {}
next_available_order_id: int = 0


@app.route('/front')
def front():
	"""Front-of-House (FOH), i.e. restaurant side.

	This view shows order numbers of both in-progress and ready items.
	"""
	return render_template('front.html')


@app.route('/back')
def back():
	"""Back-of-House (BOH), i.e. kitchen side.

	This view is used to add, edit and remove order numbers.
	"""
	return render_template('back.html')


@app.get('/list')
def list_orders():
	"""Returns a list of pending and completed orders."""
	return {
		'pending_orders': pending_orders,
		'completed_orders': completed_orders
	}


@app.post('/add')
def add_order():
	"""Creates a pending order with the given order number."""
	global next_available_order_id
	order_id = next_available_order_id
	next_available_order_id += 1
	order_number = int(request.json['order_number'])
	pending_orders[order_id] = order_number
	return '', HTTP_STATUS_RESET_CONTENT


@app.post('/complete')
def complete_order():
	"""Moves the order with matching id from pending to completed."""
	order_id = int(request.json['order_id'])
	if order_id in pending_orders:
		order_number = pending_orders[order_id]
		del pending_orders[order_id]
		completed_orders[order_id] = order_number
		return '', HTTP_STATUS_RESET_CONTENT
	else:
		return (
			f'No pending order with id {order_id} found',
			HTTP_STATUS_NOT_FOUND)


@app.post('/redo')
def redo_order():
	"""Moves the order with matching id from completed to pending."""
	order_id = int(request.json['order_id'])
	if order_id in completed_orders:
		order_number = completed_orders[order_id]
		del completed_orders[order_id]
		pending_orders[order_id] = order_number
		return '', HTTP_STATUS_RESET_CONTENT
	else:
		return (
			f'No completed order with id {order_id} found',
			HTTP_STATUS_NOT_FOUND)
