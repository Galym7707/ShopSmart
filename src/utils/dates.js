export const ONE_DAY_IN_MILLISECONDS = 86400000; // 24 * 60 * 60 * 1000
export const CURRENT_DATE = new Date(); // Current date as a JS Date object

/**
 * Get a new JavaScript Date that is `offset` days in the future.
 * @param {number} offset The number of days to offset from now.
 * @returns {Date}
 */
export function getFutureDate(offset) {
	if (typeof offset !== 'number' || isNaN(offset)) {
		// console.warn('getFutureDate: Invalid offset, defaulting to 0', offset);
		offset = 0;
	}
	return new Date(Date.now() + offset * ONE_DAY_IN_MILLISECONDS);
}

/**
 * Compute days between two JavaScript Date objects.
 * Returns a positive number if endingDate is after startingDate, negative otherwise.
 * @param {Date | null} startingDate Starting date of interval.
 * @param {Date | null} endingDate Ending date of interval.
 * @returns {number} The number of full days between the two dates.
 */
export function getDaysBetweenDates(startingDate, endingDate) {
	// Ensure both are valid Date objects. If not, or if one is null, behavior might be unexpected.
	// For this function, we'll assume they are valid or will result in NaN which Math.floor handles.
	if (!(startingDate instanceof Date) || !(endingDate instanceof Date)) {
		// console.warn('getDaysBetweenDates: Invalid date(s) provided.', { startingDate, endingDate });
		// Depending on desired behavior, could return 0, NaN, or throw error.
		// For now, let it proceed; getTime() on non-Date will likely cause error or NaN.
		// Or, more robustly:
		if (!startingDate || !endingDate) return 0; // Or handle as error
	}

	const startingDateInMilliseconds = startingDate.getTime();
	const endingDateInMilliseconds = endingDate.getTime();

	const daysElapsed = Math.floor(
		(endingDateInMilliseconds - startingDateInMilliseconds) /
			ONE_DAY_IN_MILLISECONDS,
	);

	return daysElapsed;
}

/**
 * Sorting compare callback function. Defines sorting order based on purchasing urgency.
 * Items are sorted by days until next purchase (ascending), then alphabetically by name.
 * @param {Object} itemA First item for comparison.
 * @param {Object} itemB Second item for comparison.
 * @returns {number}
 */
function compareItemUrgencyCallback(itemA, itemB) {
	// itemA.dateNextPurchased and itemB.dateNextPurchased are already JS Date objects (or null)
	// from getItemData in firebase.js

	const daysUntilNextPurchaseA = itemA.dateNextPurchased
		? getDaysBetweenDates(CURRENT_DATE, itemA.dateNextPurchased)
		: Infinity; // Treat null/undefined dateNextPurchased as very far in the future

	const daysUntilNextPurchaseB = itemB.dateNextPurchased
		? getDaysBetweenDates(CURRENT_DATE, itemB.dateNextPurchased)
		: Infinity;

	if (daysUntilNextPurchaseA < daysUntilNextPurchaseB) {
		return -1;
	}
	if (daysUntilNextPurchaseA > daysUntilNextPurchaseB) {
		return 1;
	}

	// If days are equal, sort alphabetically by name
	const nameA = typeof itemA.name === 'string' ? itemA.name.toLowerCase() : '';
	const nameB = typeof itemB.name === 'string' ? itemB.name.toLowerCase() : '';

	if (nameA < nameB) {
		return -1;
	}
	if (nameA > nameB) {
		return 1;
	}
	return 0;
}

/**
 * Assign a purchase urgency property to each item in an unsorted array and
 * return the array sorted in order of purchase urgency.
 * @param {Object[]} unsortedList An array of item objects.
 * @returns {Object[]} A new array of item objects, sorted and with an 'urgency' property.
 */
export function comparePurchaseUrgency(unsortedList) {
	if (!Array.isArray(unsortedList)) return [];

	const listWithUrgency = unsortedList.map((item) => {
		// Ensure item and its date properties are valid before processing
		if (!item || !(item.dateNextPurchased instanceof Date)) {
			// Handle invalid item structure or missing/invalid dateNextPurchased
			return { ...item, urgency: 'unknown' }; // or some default/error state
		}

		// dateLastPurchased and dateNextPurchased are already JS Date objects (or null)
		// from getItemData in firebase.js
		const jsDateLastPurchased = item.dateLastPurchased; // This is already a JS Date or null
		const jsDateNextPurchased = item.dateNextPurchased; // This is already a JS Date or null

		// Calculate daysSinceLastPurchased (if dateLastPurchased exists)
		const daysSinceLastPurchased = jsDateLastPurchased
			? getDaysBetweenDates(jsDateLastPurchased, CURRENT_DATE)
			: null; // Or some other indicator for "never purchased"

		// Calculate daysUntilNextPurchase
		const daysUntilNextPurchase = getDaysBetweenDates(
			CURRENT_DATE,
			jsDateNextPurchased, // Already a JS Date
		);

		let urgency;
		if (
			daysSinceLastPurchased !== null &&
			daysSinceLastPurchased > 2 * daysUntilNextPurchase &&
			daysSinceLastPurchased > 60
		) {
			// If it's been a long time AND more than twice the estimated interval, consider inactive
			// This is a heuristic from the original project's `ArchivedListItem` logic
			urgency = 'inactive';
		} else if (daysUntilNextPurchase <= 7) {
			urgency = 'soon';
		} else if (daysUntilNextPurchase <= 21) {
			// Changed from < 30 to < 21 based on original urgency logic
			urgency = 'kind of soon';
		} else {
			urgency = 'not soon';
		}

		return { ...item, urgency, daysUntilNextPurchase }; // Add urgency and days for sorting
	});

	// Sort the list using the callback
	return listWithUrgency.sort(compareItemUrgencyCallback);
}
