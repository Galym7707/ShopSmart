import { useState, useEffect } from 'react'; // Добавил useEffect
import { addItem } from '../api'; // Теперь правильно импортирует из api/index.js -> api/firebase.js
import {
	Button,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormLabel,
	TextField,
	Box,
	Typography, // Для сообщений
	CircularProgress, // Для индикатора загрузки
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Добавил useNavigate

export function AddItem({ listToken, data }) {
	// 'data' теперь будет передаваться из App.jsx
	const { state } = useLocation();
	const itemUserSearchedFor = state?.itemUserSearchedFor;
	const [itemName, setItemName] = useState(itemUserSearchedFor || '');
	const [daysUntilNextPurchase, setDaysUntilNextPurchase] = useState(7); // По умолчанию 'soon'
	// const [error, setError] = useState(false); // Можно удалить, если используем userAlertMessage
	const [userAlertMessage, setUserAlertMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false); // Для индикатора загрузки
	const navigate = useNavigate(); // Для перенаправления после добавления

	// Если itemUserSearchedFor есть, устанавливаем его в itemName при первом рендере
	useEffect(() => {
		if (itemUserSearchedFor) {
			setItemName(itemUserSearchedFor);
		}
	}, [itemUserSearchedFor]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setUserAlertMessage(''); // Сбрасываем предыдущие сообщения
		setIsSubmitting(true); // Начинаем отправку

		const normalizedItemNameRegex = /[\\s\\W]|_+|s$/g;
		const trimmedItemName = itemName.trim(); // Убираем пробелы в начале и конце
		const normalizedItemName = trimmedItemName
			.toLowerCase()
			.replace(normalizedItemNameRegex, '');

		if (trimmedItemName === '') {
			setUserAlertMessage('Please enter an item name.');
			setIsSubmitting(false);
			return;
		}

		// Проверка на существующий элемент (убедись, что 'data' действительно содержит актуальные данные списка)
		// Для этой проверки 'data' должен быть массивом объектов item из Firestore
		const itemExists =
			data && Array.isArray(data)
				? data.find(
						(item) =>
							item.normalizedName === normalizedItemName || // Проверка по нормализованному имени
							(item.name &&
								item.name.toLowerCase().replace(normalizedItemNameRegex, '') === // Дополнительная проверка, если normalizedName нет
									normalizedItemName),
				  )
				: false;

		if (itemExists) {
			setUserAlertMessage(
				`"${trimmedItemName}" already exists in your shopping list.`,
			);
			setIsSubmitting(false);
			return;
		}

		try {
			await addItem(listToken, {
				itemName: trimmedItemName, // Передаем очищенное имя
				daysUntilNextPurchase,
			});
			setUserAlertMessage(`"${trimmedItemName}" was successfully added!`);
			setItemName(''); // Очищаем поле после успешного добавления
			// setDaysUntilNextPurchase(7); // Можно сбросить на значение по умолчанию
			// navigate('/list'); // Опционально: перенаправляем на страницу списка
		} catch (error) {
			console.error('Error in AddItem handleSubmit:', error);
			setUserAlertMessage(
				`Oops! Something went wrong. Could not add item. ${error.message}`,
			);
		} finally {
			setIsSubmitting(false); // Завершаем отправку в любом случае
		}
	};

	return (
		// Обернем в Box для лучшего контроля над шириной и выравниванием
		<Box
			component="form" // Используем form для семантики
			onSubmit={handleSubmit} // Привязываем handleSubmit к событию onSubmit формы
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2, // Отступы между элементами
				width: '100%',
				maxWidth: '500px', // Ограничим максимальную ширину формы
				p: { xs: 2, sm: 3 }, // Паддинги
				border: (theme) => `1px solid ${theme.palette.divider}`,
				borderRadius: (theme) => theme.shape.borderRadius,
				boxShadow: (theme) => theme.shadows[2],
				bgcolor: 'background.paper',
			}}
		>
			<Typography variant="h5" component="h2" gutterBottom textAlign="center">
				Add Item to List
			</Typography>

			<TextField
				id="item-name-input"
				label="Item name"
				variant="outlined"
				value={itemName} // Управляемый компонент
				onChange={(e) => {
					setItemName(e.target.value);
					if (userAlertMessage) setUserAlertMessage(''); // Сбрасываем сообщение при вводе
				}}
				required // Делаем поле обязательным
				fullWidth // Занимает всю доступную ширину
				disabled={isSubmitting}
			/>
			<FormControl component="fieldset" disabled={isSubmitting}>
				{' '}
				{/* Обертка для RadioGroup */}
				<FormLabel component="legend">
					How soon will you buy this item?
				</FormLabel>
				<RadioGroup
					row // Расположим радиокнопки в ряд для экономии места
					aria-label="days-until-next-purchase"
					name="days-until-next-purchase-group"
					value={daysUntilNextPurchase}
					onChange={(e) =>
						setDaysUntilNextPurchase(parseInt(e.target.value, 10))
					}
				>
					<FormControlLabel
						value={7} // Значение теперь число
						control={<Radio />}
						label="Soon (7 days)"
					/>
					<FormControlLabel
						value={14}
						control={<Radio />}
						label="Kind of soon (14 days)"
					/>
					<FormControlLabel
						value={30}
						control={<Radio />}
						label="Not soon (30 days)"
					/>
				</RadioGroup>
			</FormControl>

			{userAlertMessage && (
				<Typography
					color={
						userAlertMessage.startsWith('Oops!') ? 'error' : 'success.main'
					} // Цвет в зависимости от сообщения
					sx={{ textAlign: 'center', mt: 1, mb: 1 }}
				>
					{userAlertMessage}
				</Typography>
			)}

			<Button
				type="submit" // type="submit" для формы
				variant="contained"
				color="primary" // Используем основной цвет темы
				size="large"
				disabled={isSubmitting || !itemName.trim()} // Кнопка неактивна, если идет отправка или имя пустое
				fullWidth
				sx={{ mt: 1 }} // Небольшой отступ сверху
			>
				{isSubmitting ? (
					<CircularProgress size={24} color="inherit" />
				) : (
					'Add item'
				)}
			</Button>
		</Box>
	);
}
