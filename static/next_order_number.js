
/** Interface for accessing the displayed next order number.
 *
 * The state is stored only in the DOM to avoid out-of-sync duplicates.
 */
export class NextOrderNumber {
	/** @type {HTMLElement} */
	#element;

	/** Initializes the next order number.
	 *
	 * The value is set to be one higher than order number of the latest order.
	 * @param {HTMLElement} nextOrderNumberElement
	 */
	constructor(nextOrderNumberElement) {
		this.#element = nextOrderNumberElement;

		const orderElements = document.querySelectorAll('.order');
		let nextAvailableOrderNumber = 0;
		let currentHighestId = -1;
		for (const orderElement of orderElements) {
			const id = Number(orderElement.dataset.id);
			const orderNumber = Number(orderElement.textContent);
			if (id > currentHighestId) {
				nextAvailableOrderNumber = orderNumber + 1;
				currentHighestId = id;
			}
		}
		this.set(nextAvailableOrderNumber);
	}

	/** Increments modulo 100 to limit value to two digits. Returns null if no
	 * value is set.
	 * @returns {Number|null}
	 */
	get_and_increment() {
		const orderNumberString = this.#element.textContent;
		if (orderNumberString) {
			const orderNumber = Number(orderNumberString);
			const updatedOrderNumber = (orderNumber + 1) % 100;
			this.set(updatedOrderNumber);
			return orderNumber;
		} else {
			return null;
		}
	}

	/** Only one or two positive digits allowed.
	 * @param {Number} orderNumber
	 */
	set(orderNumber) {
		if (orderNumber < 0 || orderNumber > 99) {
			throw new Error(
				`Only one or two positive digits allowed: ${orderNumber}`
			);
		}
		this.#element.textContent = orderNumber;
	}
};
