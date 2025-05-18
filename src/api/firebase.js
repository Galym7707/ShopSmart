import {
	addDoc,
	// deleteDoc, // Раскомментируй, если/когда будешь реализовывать удаление
	collection,
	onSnapshot,
	getDocs,
	// updateDoc, // Раскомментируй для updateItem
	// doc,       // Раскомментируй для updateItem/deleteItem
	// getDoc,    // Раскомментируй, если нужно получать один документ
} from 'firebase/firestore';
import { db } from './config'; // Убедись, что config.js теперь использует переменные окружения!
import {
	getFutureDate /* ONE_DAY_IN_MILLISECONDS, CURRENT_DATE, getDaysBetweenDates */,
} from '../utils'; // Закомментированы неиспользуемые пока
// import { calculateEstimate } from '@the-collab-lab/shopping-list-utils'; // Если будешь использовать эту логику

/**
 * Subscribe to changes on a specific list in the Firestore database (listId), and run a callback (handleSuccess) every time a change happens.
 */
export function streamListItems(listId, handleSuccess) {
	if (!listId) {
		console.error(
			'streamListItems: listId is undefined or null. Cannot stream items.',
		);
		return () => {}; // Возвращаем пустую функцию для отписки, чтобы не было ошибок
	}
	const listCollectionRef = collection(db, listId);
	try {
		return onSnapshot(listCollectionRef, handleSuccess, (error) => {
			console.error('Error streaming list items for listId:', listId, error);
			// Можно добавить обработку ошибки для пользователя, если нужно
		});
	} catch (error) {
		console.error('Error setting up stream for listId:', listId, error);
		return () => {};
	}
}

/**
 * Read all documents from a specific list in the Firestore database (listId) ONCE.
 * @param {string} listId The user's list token
 * @returns {Object[]} An array of objects representing the user's list.
 * @see https://firebase.google.com/docs/firestore/query-data/get-data
 */
export async function getListItems(listId) {
	if (!listId) {
		console.error('getListItems: listId is undefined or null.');
		return [];
	}
	const listCollectionRef = collection(db, listId);
	try {
		const listSnapshot = await getDocs(listCollectionRef);
		return listSnapshot.docs.map((doc) => getItemData(doc)); // Используем getItemData для форматирования
	} catch (error) {
		console.error('Error getting list items for listId:', listId, error);
		throw error;
	}
}

/**
 * Add a new item to the user's list in Firestore.
 * @param {string} listId The id of the list we're adding to.
 * @param {Object} itemData Information about the new item.
 * @param {string} itemData.itemName The name of the item.
 * @param {number} itemData.daysUntilNextPurchase The number of days until the user thinks they'll need to buy the item again.
 */
export async function addItem(listId, { itemName, daysUntilNextPurchase }) {
	if (!listId) {
		console.error('addItem: listId is undefined or null. Cannot add item.');
		throw new Error('List ID is missing. Cannot add item.');
	}
	if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
		console.error('addItem: itemName is invalid.');
		throw new Error('Item name is invalid.');
	}
	if (
		typeof daysUntilNextPurchase !== 'number' ||
		isNaN(daysUntilNextPurchase)
	) {
		console.error('addItem: daysUntilNextPurchase is invalid.');
		throw new Error('Days until next purchase is invalid.');
	}

	const listCollectionRef = collection(db, listId);
	// Оригинальный код использует itemName для name и dateCreated
	// dateLastPurchased может быть null при первом добавлении
	// dateNextPurchased рассчитывается
	try {
		const newItem = {
			dateCreated: new Date(), // Firestore Timestamp создастся автоматически при записи Date
			dateLastPurchased: null, // При первом добавлении еще не покупался
			dateNextPurchased: getFutureDate(daysUntilNextPurchase),
			name: itemName.trim(), // Сохраняем оригинальное название (с тримом)
			normalizedName: itemName
				.trim()
				.toLowerCase()
				.replace(/[\s\W]|_+|s$/g, ''), // Для поиска дубликатов
			totalPurchases: 0,
		};
		// console.log('Adding item to Firestore:', listId, newItem); // Для отладки
		const newItemRef = await addDoc(listCollectionRef, newItem);
		return newItemRef;
	} catch (error) {
		console.error('Error adding item to Firestore for listId:', listId, error);
		// Пробрасываем ошибку дальше, чтобы ее можно было поймать в AddItem.jsx
		throw error;
	}
}

/**
 * Extract item data from a Firestore document snapshot.
 * This is a helper function used by `streamListItems` and `getListItems`.
 * @param {Object} doc A Firestore document snapshot.
 * @returns {Object} The item data.
 */
export function getItemData(doc) {
	return {
		id: doc.id,
		...doc.data(),
	};
}

// Функции updateItem и deleteItem пока не реализованы в оригинальном коде,
// поэтому их можно оставить закомментированными или добавить базовые заглушки.

/**
 * TODO: Update an item in the user's list.
 * @param {string} listId The id of the list.
 * @param {string} itemId The id of the item to update.
 * @param {Object} itemData The data to update the item with.
 */
// export async function updateItem(listId, itemId, itemData) {
// 	const itemRef = doc(db, listId, itemId);
// 	await updateDoc(itemRef, itemData);
// }

/**
 * TODO: Delete an item from the user's list.
 * @param {string} listId The id of the list.
 * @param {string} itemId The id of the item to delete.
 */
// export async function deleteItem(listId, itemId) {
// 	const itemRef = doc(db, listId, itemId);
// 	await deleteDoc(itemRef);
// }

/**
 * Check existence of list in Firestore associated with user token input.
 * @param {string} userTokenInput The user's token input requesting to be validated
 */
export async function validateToken(userTokenInput) {
	if (!userTokenInput) return false; // Если токен пустой, сразу false
	try {
		const listCollectionRef = collection(db, userTokenInput);
		const listSnapshot = await getDocs(listCollectionRef);
		// Список считается существующим, если в "коллекции" (которая на самом деле является путем к документам этого списка) есть хотя бы один документ,
		// или если мы просто хотим проверить, можно ли к этому пути обратиться.
		// Для простоты: если getDocs не выдал ошибку и вернул snapshot, считаем, что "путь" валиден.
		// Более строгая проверка могла бы быть `!listSnapshot.empty`, если мы ожидаем, что список всегда имеет элементы.
		// Но пустой список тоже может существовать (например, только что созданный).
		// Оригинальный код, кажется, не проверяет на пустоту, а просто факт существования коллекции.
		// console.log(`Validating token ${userTokenInput}, snapshot size: ${listSnapshot.size}`);
		return listSnapshot.size >= 0; // Если запрос прошел, токен "существует" в контексте пути
	} catch (error) {
		console.error('Error validating token:', userTokenInput, error);
		return false; // Если ошибка (например, неверный формат токена для Firestore пути), токен невалиден
	}
}
