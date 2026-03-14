
/** Interface for accessing the displayed next order number.
 *
 * The state is stored only in the DOM to avoid out-of-sync duplicates.
 */
export class NextOrderNumber {
	/** @type {HTMLElement} */
	#element;

	/** Initializes the next order number.
	 * @param {HTMLElement} nextOrderNumberElement
	 */
	constructor(nextOrderNumberElement) {
		this.#element = nextOrderNumberElement;
	}

	/** Increments modulo 100 to limit value to two digits. Returns null if no
	 * value is set.
	 * @returns {Number|null}
	 */
	get_and_increment() {
		const orderNumberString = this.#element.textContent.trim();
		if (orderNumberString) {
			const orderNumber = Number(orderNumberString);
			const updatedOrderNumber = (orderNumber + 1) % 100;
			this.set(updatedOrderNumber);
			return orderNumber;
		} else {
			return null;
		}
	}

	/** Only one or two digits allowed.
	 * @param {Number} orderNumber
	 */
	set(orderNumber) {
		if (!Number.isInteger(orderNumber)) {
			throw new Error(`Order number must be an integer: ${orderNumber}`);
		}
		if (orderNumber < 0 || orderNumber > 99) {
			throw new Error(
				`Only one or two digits allowed: ${orderNumber}`
			);
		}
		this.#element.textContent = orderNumber;
	}

	/** Appends a digit if possible. Leading zeroes are removed.
	 * @param {number} digit
	 */
	appendDigit(digit) {
		if (!Number.isInteger(digit)) {
			throw new Error(`Digit must be an integer: ${digit}`);
		}
		if (digit < 0 || digit > 9) {
			throw new Error(`Can only append a digit: ${digit}`);
		}

		let orderNumberString = this.#element.textContent.trim();
		switch (orderNumberString.length) {
		case 0:
			// Set digit directly if no value has been set.
			orderNumberString = `${digit}`;
			break;
		case 1:
			// Ensure no leading zeros.
			if (orderNumberString === '0') {
				orderNumberString = '';
			}
			// Append digit.
			orderNumberString += digit;
			break;
		case 2:
			// Do nothing if two digits are already set.
			return;
		default:
			throw new Error(
				'Next order number should have no more than two digits:'
				` ${orderNumberString}`
			);
		}
		this.#element.textContent = orderNumberString;
	}

	/** Clear the value, i.e. the string representation will be empty. */
	clear() {
		this.#element.textContent = '';
	}
};
