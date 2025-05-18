import React from 'react'; // Импортируем React
import {
	ListItem,
	ListItemText,
	IconButton,
	Checkbox,
	Typography,
	Box,
	useTheme, // Для доступа к цветам темы
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Иконка для купленного
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'; // Для некупленного
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Для неопределенной срочности

// Функция для определения цвета и иконки в зависимости от срочности
const getUrgencyStyle = (urgency, theme, isPurchased) => {
	if (isPurchased) {
		return {
			// Можно сделать цвет фона другим для купленных или добавить перечеркивание тексту
			// backgroundColor: alpha(theme.palette.success.light, 0.1),
			textDecoration: 'line-through',
			color: theme.palette.text.disabled,
			iconColor: theme.palette.success.main, // Зеленый для галочки
		};
	}
	switch (urgency) {
		case 'soon': // < 7 дней
			return {
				backgroundColor:
					theme.palette.mode === 'dark'
						? theme.palette.error.dark
						: theme.palette.error.light,
				color: theme.palette.error.contrastText,
				iconColor: theme.palette.error.main,
			};
		case 'kind of soon': // 7-21 дней
			return {
				backgroundColor:
					theme.palette.mode === 'dark'
						? theme.palette.warning.dark
						: theme.palette.warning.light,
				color: theme.palette.warning.contrastText,
				iconColor: theme.palette.warning.main,
			};
		case 'not soon': // > 21 дней
			return {
				backgroundColor:
					theme.palette.mode === 'dark'
						? theme.palette.success.dark
						: theme.palette.success.light,
				color: theme.palette.success.contrastText,
				iconColor: theme.palette.info.main, // Синий для "не скоро"
			};
		default: // Неактивные или неопределенные
			return {
				backgroundColor:
					theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 200],
				color: theme.palette.text.secondary,
				iconColor: theme.palette.action.disabled,
			};
	}
};

export function ListItemComponent({
	item,
	onMarkAsPurchased,
	onDeleteItem,
	isPurchased,
	disabled,
}) {
	const theme = useTheme();

	if (!item || !item.name) {
		// Можно вернуть null или какой-то плейсхолдер, если элемент невалиден
		return null;
	}

	const handleCheckboxChange = () => {
		if (!disabled) {
			onMarkAsPurchased(item);
		}
	};

	const handleDeleteClick = () => {
		if (!disabled) {
			onDeleteItem(item);
		}
	};

	// Определяем стиль на основе срочности и статуса покупки
	const urgencyStyle = getUrgencyStyle(item.urgency, theme, isPurchased);

	// Текст для отображения срочности
	let urgencyText = '';
	if (isPurchased) {
		urgencyText = 'Purchased';
	} else {
		switch (item.urgency) {
			case 'soon':
				urgencyText = 'Buy Soon';
				break;
			case 'kind of soon':
				urgencyText = 'Buy Kind of Soon';
				break;
			case 'not soon':
				urgencyText = 'Buy Not Soon';
				break;
			default:
				urgencyText = 'Inactive/Unknown';
		}
	}

	// Определяем, когда была последняя покупка (если была)
	let lastPurchasedText = '';
	if (item.dateLastPurchased) {
		try {
			lastPurchasedText = `Last purchased: ${new Date(
				item.dateLastPurchased,
			).toLocaleDateString()}`;
		} catch (e) {
			/* Ошибка конвертации даты, оставляем пустым */
		}
	}

	return (
		<ListItem
			disablePadding
			sx={{
				mb: 1.5, // Отступ между элементами списка
				bgcolor: 'background.paper', // Фон элемента
				borderRadius: theme.shape.borderRadius,
				boxShadow: theme.shadows[1],
				borderLeft: `5px solid ${
					urgencyStyle.iconColor || theme.palette.divider
				}`, // Цветовая метка срочности
				opacity: disabled ? 0.7 : 1, // Полупрозрачность при блокировке
				transition: 'opacity 0.3s ease',
				'&:hover': {
					boxShadow: theme.shadows[3],
				},
			}}
			secondaryAction={
				<IconButton
					edge="end"
					aria-label="delete item"
					onClick={handleDeleteClick}
					disabled={disabled}
					title={`Delete ${item.name}`}
				>
					<DeleteIcon />
				</IconButton>
			}
		>
			<Checkbox
				edge="start"
				checked={isPurchased}
				onChange={handleCheckboxChange}
				disabled={disabled}
				icon={<RadioButtonUncheckedIcon />} // Иконка для не отмеченного
				checkedIcon={<ShoppingCartIcon />} // Иконка для отмеченного (куплено)
				sx={{
					color: urgencyStyle.iconColor, // Цвет иконки чекбокса
					'&.Mui-checked': {
						color: theme.palette.success.main, // Явно зеленый для купленного
					},
					mr: 1,
				}}
				aria-label={`Mark ${item.name} as purchased`}
			/>
			<ListItemText
				primary={
					<Typography
						variant="h6"
						component="span"
						sx={{
							textDecoration: isPurchased ? 'line-through' : 'none',
							color: isPurchased ? theme.palette.text.disabled : 'text.primary',
							fontWeight: isPurchased ? 'normal' : 'medium',
						}}
					>
						{item.name}
					</Typography>
				}
				secondary={
					<Box
						component="span"
						sx={{
							display: 'block',
							fontSize: '0.8rem',
							color: 'text.secondary',
							mt: 0.5,
						}}
					>
						<Typography variant="caption" display="block">
							Urgency: {urgencyText}
						</Typography>
						{lastPurchasedText && (
							<Typography variant="caption" display="block">
								{lastPurchasedText}
							</Typography>
						)}
						<Typography variant="caption" display="block">
							Total Purchases: {item.totalPurchases || 0}
						</Typography>
					</Box>
				}
			/>
		</ListItem>
	);
}
