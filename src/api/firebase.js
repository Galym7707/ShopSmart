import {
	addDoc,
	deleteDoc,
	collection,
	onSnapshot,
	getDocs,
	updateDoc,
	doc,
	getDoc, // Нужен для получения документа перед обновлением
} from 'firebase/firestore';
import { db } from './config';
import {
	getFutureDate,
	getDaysBetweenDates, // Нужен для calculateEstimate
	CURRENT_DATE, // Нужен для calculateEstimate
	ONE_DAY_IN_MILLISECONDS, // Нужен для определения, был ли товар куплен недавно
} from '../utils'; // Убедись, что все эти функции экспортируются из utils/index.js или utils/dates.js
import { calculateEstimate } from '@the-collab-lab/shopping-list-utils'; // Эта утилита используется для "умного" списка

/**
 * Helper function to normalize item names for consistent checking.
 */
function normalizeItemName(itemName) {
	if (typeof itemName !== 'string') return '';
	return itemName
		.trim()
		.toLowerCase()
		.replace(/[\s\W]|_+/g, '')
		.replace(/s$/, '');
}

/**
 * Subscribe to changes on a specific list in the Firestore database (listId),
 * and run a callback (handleSuccess) every time a change happens.
 */
export function streamListItems(listId, handleSuccess) {
	if (!listId || typeof listId !== 'string') {
		console.error(
			'streamListItems: listId is invalid or missing. listId:',
			listId,
		);
		return () => {};
	}
	const listCollectionRef = collection(db, listId);
	try {
		return onSnapshot(
			listCollectionRef,
			(snapshot) => {
				handleSuccess(snapshot);
			},
			(error) => {
				console.error(
					`Error streaming list items for listId "${listId}":`,
					error,
				);
			},
		);
	} catch (error) {
		console.error(`Failed to set up stream for listId "${listId}":`, error);
		return () => {};
	}
}

/**
 * Read all documents from a specific list in the Firestore database (listId) ONCE.
 */
export async function getListItems(listId) {
	if (!listId || typeof listId !== 'string') {
		console.error(
			'getListItems: listId is invalid or missing. listId:',
			listId,
		);
		return [];
	}
	const listCollectionRef = collection(db, listId);
	try {
		const listSnapshot = await getDocs(listCollectionRef);
		return listSnapshot.docs.map(getItemData);
	} catch (error) {
		console.error(`Error getting list items for listId "${listId}":`, error);
		throw error;
	}
}

/**
 * Add a new item to the user's list in Firestore.
 */
export async function addItem(listId, { itemName, daysUntilNextPurchase }) {
	if (!listId || typeof listId !== 'string') {
		const err = new Error('List ID is missing or invalid. Cannot add item.');
		console.error('addItem Error:', err.message, 'listId:', listId);
		throw err;
	}
	const trimmedItemName = typeof itemName === 'string' ? itemName.trim() : '';
	if (!trimmedItemName) {
		const err = new Error('Item name is missing or invalid.');
		console.error('addItem Error:', err.message, 'itemName:', itemName);
		throw err;
	}
	if (
		typeof daysUntilNextPurchase !== 'number' ||
		isNaN(daysUntilNextPurchase)
	) {
		const err = new Error('Days until next purchase is invalid.');
		console.error(
			'addItem Error:',
			err.message,
			'days:',
			daysUntilNextPurchase,
		);
		throw err;
	}

	const listCollectionRef = collection(db, listId);
	const newItemData = {
		name: trimmedItemName,
		normalizedName: normalizeItemName(trimmedItemName),
		dateCreated: new Date(),
		dateLastPurchased: null,
		dateNextPurchased: getFutureDate(daysUntilNextPurchase),
		totalPurchases: 0,
	};

	try {
		const docRef = await addDoc(listCollectionRef, newItemData);
		return docRef;
	} catch (error) {
		console.error(
			`Error adding item to list "${listId}":`,
			error.message,
			error,
		);
		throw error;
	}
}

/**
 * Helper function to extract item data from a Firestore document snapshot.
 */
// Фрагмент из firebase_api_js_full_crud -> getItemData
export function getItemData(doc) {
	const data = doc.data();
	if (!data) {
		return { id: doc.id };
	}
	// Convert Firestore Timestamps to JavaScript Date objects
	const dateCreated = data.dateCreated?.toDate
		? data.dateCreated.toDate()
		: null;
	const dateLastPurchased = data.dateLastPurchased?.toDate
		? data.dateLastPurchased.toDate()
		: null;
	const dateNextPurchased = data.dateNextPurchased?.toDate
		? data.dateNextPurchased.toDate()
		: null; // ЭТО УЖЕ JS DATE

	return {
		id: doc.id,
		name: data.name || '',
		normalizedName: data.normalizedName || normalizeItemName(data.name || ''),
		dateCreated: dateCreated,
		dateLastPurchased: dateLastPurchased,
		dateNextPurchased: dateNextPurchased, // ПЕРЕДАЕТСЯ КАК JS DATE
		totalPurchases: data.totalPurchases || 0,
	};
}

/**
 * Check existence of list in Firestore associated with user token input.
 */
export async function validateToken(userTokenInput) {
	if (
		!userTokenInput ||
		typeof userTokenInput !== 'string' ||
		userTokenInput.trim() === ''
	) {
		return false;
	}
	try {
		const listCollectionRef = collection(db, userTokenInput.trim());
		await getDocs(listCollectionRef); // Просто пытаемся прочитать коллекцию
		return true;
	} catch (error) {
		console.error(`Error validating token "${userTokenInput}":`, error.message);
		return false;
	}
}

/**
 * Update an item in the user's list, typically when it's marked as purchased.
 * This function implements the "smart" logic from the original Collab Lab project.
 * @param {string} listId The id of the list.
 * @param {string} itemId The id of the item to update.
 */
export async function updateItem(listId, itemId) {
	if (!listId || !itemId) {
		const err = new Error('Missing listId or itemId for updateItem.');
		console.error(err.message);
		throw err;
	}
	const itemRef = doc(db, listId, itemId);

	try {
		const itemSnap = await getDoc(itemRef);
		if (!itemSnap.exists()) {
			throw new Error(`Item with ID ${itemId} not found in list ${listId}.`);
		}

		const itemData = itemSnap.data();
		const now = new Date(); // Текущее время для dateLastPurchased

		// Данные из документа (Firestore Timestamps нужно конвертировать в JS Date)
		const dateLastPurchased = itemData.dateLastPurchased
			? itemData.dateLastPurchased.toDate()
			: CURRENT_DATE; // Если не было покупок, используем CURRENT_DATE для расчета первого интервала
		const dateNextPurchased = itemData.dateNextPurchased.toDate();

		let totalPurchases = itemData.totalPurchases || 0;

		// Рассчитываем предыдущий интервал и новый интервал
		const previousEstimateOfDays = getDaysBetweenDates(
			dateLastPurchased, // Если dateLastPurchased null, getDaysBetweenDates должен это учесть или мы берем dateCreated
			dateNextPurchased,
		);

		const actualNumberOfDays = itemData.dateLastPurchased // Если уже покупался
			? getDaysBetweenDates(dateLastPurchased, now)
			: getDaysBetweenDates(itemData.dateCreated.toDate(), now); // Если первая покупка, считаем от создания

		totalPurchases++;

		const newEstimateOfDays = calculateEstimate(
			previousEstimateOfDays,
			actualNumberOfDays,
			totalPurchases,
		);

		const newDateNextPurchased = getFutureDate(newEstimateOfDays);

		await updateDoc(itemRef, {
			dateLastPurchased: now,
			dateNextPurchased: newDateNextPurchased,
			totalPurchases: totalPurchases,
		});
		// console.log(`Item ${itemId} in list ${listId} updated successfully.`);
	} catch (error) {
		console.error(`Error updating item ${itemId} in list ${listId}:`, error);
		throw error;
	}
}

/**
 * Delete an item from the user's list.
 * @param {string} listId The id of the list.
 * @param {string} itemId The id of the item to delete.
 */
export async function deleteItem(listId, itemId) {
	if (!listId || !itemId) {
		const err = new Error('Missing listId or itemId for deleteItem.');
		console.error(err.message);
		throw err;
	}
	const itemRef = doc(db, listId, itemId);
	try {
		await deleteDoc(itemRef);
		// console.log(`Item ${itemId} deleted successfully from list ${listId}.`);
	} catch (error) {
		console.error(`Error deleting item ${itemId} from list ${listId}:`, error);
		throw error;
	}
}
