import React, { useState, useEffect, forwardRef } from 'react'; // Добавил React для JSX
import { Link, useNavigate } from 'react-router-dom'; // Добавил useNavigate
import { ListItemComponent } from '../components'; // Предполагаем, что ListItemComponent будет в components/index.js или напрямую
import {
	updateItem as apiUpdateItem,
	deleteItem as apiDeleteItem,
} from '../api'; // Переименовали для ясности
import { comparePurchaseUrgency, ONE_DAY_IN_MILLISECONDS } from '../utils'; // ONE_DAY_IN_MILLISECONDS для isPurchasedRecently
import {
	Container,
	List as MuiListComponent,
	TextField,
	InputAdornment,
	IconButton,
	Typography,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	DialogContentText,
	Slide,
	Box,
	// Icon, // Не используется
	useMediaQuery,
	CircularProgress, // Для индикатора загрузки
	Alert, // Для сообщений пользователю
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import './List.css'; // Убедись, что стили здесь не конфликтуют

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function List({ data, listToken }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [itemToActOn, setItemToActOn] = useState(null); // Для удаления или других действий
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false); // Общий индикатор загрузки для действий
	const [userAlert, setUserAlert] = useState({ message: '', severity: '' });

	const matchesMobileDevice = useMediaQuery('(max-width:600px)');
	const navigate = useNavigate();

	// Фильтрация списка
	const filteredList = data.filter((item) => {
		if (!item || typeof item.name !== 'string') return false; // Защита от невалидных данных
		if (searchTerm === '') {
			return true;
		}
		return item.name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	// Сортировка списка
	const sortedList = comparePurchaseUrgency(filteredList);

	const handleMarkAsPurchased = async (item) => {
		if (!item || !item.id) return;
		setIsLoading(true);
		setUserAlert({ message: '', severity: '' });
		try {
			await apiUpdateItem(listToken, item.id);
			// Данные обновятся через streamListItems, нет необходимости обновлять локально вручную
			// setUserAlert({ message: `"${item.name}" marked as purchased!`, severity: 'success' });
			// Можно добавить небольшое уведомление, но список сам обновится
		} catch (error) {
			console.error('Failed to mark item as purchased:', error);
			setUserAlert({
				message: `Error updating "${item.name}": ${error.message}`,
				severity: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenDeleteDialog = (item) => {
		setItemToActOn(item);
		setIsDeleteConfirmOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		setItemToActOn(null);
		setIsDeleteConfirmOpen(false);
	};

	const handleDeleteItemConfirm = async () => {
		if (!itemToActOn || !itemToActOn.id) return;
		setIsLoading(true);
		setUserAlert({ message: '', severity: '' });
		try {
			await apiDeleteItem(listToken, itemToActOn.id);
			// setUserAlert({ message: `"${itemToActOn.name}" deleted successfully.`, severity: 'success' });
			// Список обновится через streamListItems
		} catch (error) {
			console.error('Failed to delete item:', error);
			setUserAlert({
				message: `Error deleting "${itemToActOn.name}": ${error.message}`,
				severity: 'error',
			});
		} finally {
			setIsLoading(false);
			handleCloseDeleteDialog();
		}
	};

	// Перенаправление на AddItem, если список пуст после загрузки данных
	useEffect(() => {
		if (data && data.length === 0 && listToken) {
			// Проверяем, что data загрузились и они пусты
			const timer = setTimeout(() => {
				// Небольшая задержка, чтобы пользователь увидел сообщение
				navigate('/add-item');
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [data, listToken, navigate]);

	const renderedList = sortedList.map((item) => {
		// Определяем, был ли товар куплен недавно (в течение последних 24 часов)
		// Это нужно для начального состояния чекбокса в ListItemComponent
		let isPurchasedRecently = false;
		if (item.dateLastPurchased) {
			const timeSinceLastPurchase =
				Date.now() - item.dateLastPurchased.getTime();
			isPurchasedRecently = timeSinceLastPurchase < ONE_DAY_IN_MILLISECONDS;
		}

		return (
			<ListItemComponent
				key={item.id}
				item={item}
				listToken={listToken} // listToken может понадобиться для некоторых действий внутри ListItem
				onMarkAsPurchased={handleMarkAsPurchased}
				onDeleteItem={handleOpenDeleteDialog} // Передаем обработчик для открытия диалога
				isPurchased={isPurchasedRecently} // Передаем, куплен ли товар недавно
				disabled={isLoading} // Блокируем действия, пока идет другая операция
			/>
		);
	});

	const listIsEmpty = data.length === 0; // Проверяем исходные данные, а не отфильтрованные
	const noMatchingItemsInSearch =
		filteredList.length === 0 && searchTerm !== '';

	if (isLoading && data.length === 0) {
		// Показываем загрузчик, если данные еще не пришли
		return <CircularProgress sx={{ display: 'block', margin: '50px auto' }} />;
	}

	return (
		<Box sx={{ width: '100%' }}>
			{' '}
			{/* Обертка для List, чтобы занимать всю ширину */}
			{listIsEmpty ? (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					textAlign="center"
					mt={5}
				>
					<Typography variant="h5" gutterBottom>
						Your shopping list is empty.
					</Typography>
					<Button
						component={Link} // Используем Link из react-router-dom
						to="/add-item"
						variant="contained"
						size="large"
						startIcon={<AddIcon />}
						sx={{ mt: 2 }}
					>
						Add your first item
					</Button>
				</Box>
			) : (
				<>
					<Container
						sx={{
							width: '100%',
							display: 'flex',
							justifyContent: 'center',
							mb: 2, // Отступ снизу для поля поиска
						}}
					>
						<TextField
							id="outlined-search"
							label="Search items in your list"
							type="search"
							variant="outlined"
							size={matchesMobileDevice ? 'small' : 'medium'}
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							sx={{
								width: matchesMobileDevice ? '100%' : '60%',
								maxWidth: '500px',
							}}
							InputProps={{
								// Иконка поиска в начале
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
								endAdornment: searchTerm ? ( // Кнопка очистки, если есть текст
									<InputAdornment position="end">
										<IconButton
											aria-label="clear search"
											onClick={() => setSearchTerm('')}
											edge="end"
											size="small"
										>
											<Typography
												sx={{ fontSize: '1.2rem', color: 'text.secondary' }}
											>
												&times;
											</Typography>
										</IconButton>
									</InputAdornment>
								) : null,
							}}
						/>
					</Container>

					{userAlert.message && (
						<Alert
							severity={userAlert.severity || 'info'}
							sx={{ mb: 2, width: '100%', maxWidth: '500px', marginX: 'auto' }}
						>
							{userAlert.message}
						</Alert>
					)}

					{noMatchingItemsInSearch ? (
						<Box
							display="flex"
							flexDirection="column"
							alignItems="center"
							textAlign="center"
							mt={3}
						>
							<Typography variant="subtitle1" gutterBottom>
								No items match your search for "{searchTerm}".
							</Typography>
							<Button
								component={Link}
								to="/add-item"
								state={{ itemUserSearchedFor: searchTerm }} // Передаем поисковый запрос
								variant="outlined"
								startIcon={<AddIcon />}
							>
								Add "{searchTerm}" to your list?
							</Button>
						</Box>
					) : (
						<MuiListComponent
							sx={{
								width: '100%', // Список занимает всю ширину контейнера
								maxWidth: '700px', // Ограничим максимальную ширину списка
								margin: '0 auto', // Центрируем список
								padding: 0, // Убираем внутренние отступы у MuiList
							}}
						>
							{renderedList}
						</MuiListComponent>
					)}
				</>
			)}
			<Dialog
				open={isDeleteConfirmOpen}
				TransitionComponent={Transition}
				keepMounted
				onClose={handleCloseDeleteDialog}
				aria-labelledby="alert-dialog-slide-title"
				aria-describedby="alert-dialog-slide-description"
			>
				<DialogTitle id="alert-dialog-slide-title">Delete Item</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-slide-description">
						Are you sure you want to delete "
						<Typography component="span" fontWeight="bold">
							{itemToActOn?.name}
						</Typography>
						"? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDeleteDialog} color="primary">
						Cancel
					</Button>
					<Button
						onClick={handleDeleteItemConfirm}
						color="error"
						variant="contained"
						disabled={isLoading}
					>
						{isLoading ? (
							<CircularProgress size={20} color="inherit" />
						) : (
							'Delete'
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
