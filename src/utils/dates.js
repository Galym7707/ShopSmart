export const ONE_DAY_IN_MILLISECONDS = 86400000; // 24 * 60 * 60 * 1000
export const CURRENT_DATE = new Date(); // Текущая дата как объект JS Date

/**
 * Получить новую дату JavaScript, которая на `offset` дней в будущем.
 * @param {number} offset Количество дней для смещения от текущего момента.
 * @returns {Date}
 */
export function getFutureDate(offset) {
	if (typeof offset !== 'number' || isNaN(offset)) {
		// console.warn('getFutureDate: Неверное смещение, по умолчанию 0', offset);
		offset = 0;
	}
	return new Date(Date.now() + offset * ONE_DAY_IN_MILLISECONDS);
}

/**
 * Вычислить количество дней между двумя объектами JavaScript Date.
 * Возвращает положительное число, если endingDate позже startingDate, иначе отрицательное.
 * @param {Date | null} startingDate Начальная дата интервала.
 * @param {Date | null} endingDate Конечная дата интервала.
 * @returns {number} Количество полных дней между двумя датами.
 */
export function getDaysBetweenDates(startingDate, endingDate) {
	if (!(startingDate instanceof Date) || !(endingDate instanceof Date)) {
		// console.warn('getDaysBetweenDates: Предоставлены неверные даты.', { startingDate, endingDate });
		// Если одна из дат невалидна или null, возвращаем 0 или обрабатываем как ошибку
		if (!startingDate || !endingDate) return 0;
		// Если это не объекты Date, дальнейшие вызовы getTime() вызовут ошибку
		// Для большей надежности можно было бы здесь бросить ошибку или вернуть NaN
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
 * Сравнительная функция для сортировки. Определяет порядок сортировки на основе срочности покупки.
 * Элементы сортируются по количеству дней до следующей покупки (по возрастанию), затем по алфавиту по имени.
 * @param {Object} itemA Первый элемент для сравнения.
 * @param {Object} itemB Второй элемент для сравнения.
 * @returns {number}
 */
function compareItemUrgencyCallback(itemA, itemB) {
	// itemA.dateNextPurchased и itemB.dateNextPurchased уже являются объектами JS Date (или null)
	// после обработки в getItemData в firebase.js

	const daysUntilNextPurchaseA =
		itemA.dateNextPurchased instanceof Date // Проверяем, что это Date
			? getDaysBetweenDates(CURRENT_DATE, itemA.dateNextPurchased)
			: Infinity; // Считаем null/undefined dateNextPurchased очень далеким будущим

	const daysUntilNextPurchaseB =
		itemB.dateNextPurchased instanceof Date // Проверяем, что это Date
			? getDaysBetweenDates(CURRENT_DATE, itemB.dateNextPurchased)
			: Infinity;

	if (daysUntilNextPurchaseA < daysUntilNextPurchaseB) {
		return -1;
	}
	if (daysUntilNextPurchaseA > daysUntilNextPurchaseB) {
		return 1;
	}

	// Если дни равны, сортируем по алфавиту
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
 * Назначает свойство срочности покупки каждому элементу в несортированном массиве и
 * возвращает массив, отсортированный в порядке срочности покупки.
 * @param {Object[]} unsortedList Массив объектов элементов.
 * @returns {Object[]} Новый массив объектов элементов, отсортированный и со свойством 'urgency'.
 */
export function comparePurchaseUrgency(unsortedList) {
	if (!Array.isArray(unsortedList)) return [];

	const listWithUrgency = unsortedList.map((item) => {
		if (!item) {
			return { ...item, urgency: 'unknown', daysUntilNextPurchase: Infinity };
		}

		// dateLastPurchased и dateNextPurchased уже должны быть объектами JS Date (или null)
		const jsDateLastPurchased =
			item.dateLastPurchased instanceof Date ? item.dateLastPurchased : null;
		const jsDateNextPurchased =
			item.dateNextPurchased instanceof Date ? item.dateNextPurchased : null;

		const daysSinceLastPurchased = jsDateLastPurchased
			? getDaysBetweenDates(jsDateLastPurchased, CURRENT_DATE)
			: null;

		const daysUntilNextPurchase = jsDateNextPurchased
			? getDaysBetweenDates(CURRENT_DATE, jsDateNextPurchased)
			: Infinity; // Если нет даты следующей покупки, считаем очень не скоро

		let urgency;
		// Логика определения срочности из оригинального проекта The Collab Lab
		if (
			daysSinceLastPurchased !== null &&
			daysSinceLastPurchased >= 60 &&
			daysUntilNextPurchase < 0
		) {
			// Если товар просрочен и с момента последней покупки прошло много времени,
			// и он не был куплен (daysUntilNextPurchase < 0 означает, что дата следующей покупки в прошлом)
			// Это может быть признаком неактивного товара, но оригинальная логика немного другая.
			// Оригинальная логика для "inactive" (archived) была сложнее и учитывала daysSinceLastPurchase > 2 * previousEstimate
			// Пока упростим: если просрочен и давно не покупался, то "not soon" или "unknown"
			urgency = 'not soon'; // Или 'inactive' если есть такая категория в ListItem
		} else if (daysUntilNextPurchase < 0) {
			// Просроченные товары
			urgency = 'soon'; // Считаем их самыми срочными
		} else if (daysUntilNextPurchase <= 7) {
			urgency = 'soon';
		} else if (daysUntilNextPurchase <= 21) {
			// Оригинально было < 30, но 21 (3 недели) дает более четкое разделение
			urgency = 'kind of soon';
		} else if (daysUntilNextPurchase === Infinity) {
			urgency = 'unknown'; // Если дата следующей покупки не определена
		} else {
			urgency = 'not soon';
		}

		return { ...item, urgency, daysUntilNextPurchase };
	});

	return listWithUrgency.sort(compareItemUrgencyCallback);
}
