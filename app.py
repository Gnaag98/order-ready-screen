from flask import Flask, render_template, request

app = Flask(__name__)

# Order IDs are used as keys to allow for duplicate order numbers.
pending_orders: dict[int, int] = {}
completed_orders: dict[int, int] = {}
next_available_order_id: int = 0


def get_order_response():
	"""Common response to adding/listing orders."""
	return {
		'pending_orders': pending_orders,
		'completed_orders': completed_orders
	}


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
	return get_order_response()


@app.post('/add')
def add_order():
	global next_available_order_id
	order_id = next_available_order_id
	next_available_order_id += 1
	order_number = int(request.json['order'])
	pending_orders[order_id] = order_number
	return get_order_response()
