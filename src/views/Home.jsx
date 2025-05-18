import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
	Box,
	Button,
	TextField,
	Typography,
	Stack,
	useMediaQuery,
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Divider,
	useTheme,
	IconButton,
	ListItemIcon, // Добавлен импорт ListItemIcon
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import logo from '../logo.png'; // Убедись, что путь к лого правильный

import { generateToken } from '@the-collab-lab/shopping-list-utils';
import { validateToken } from '../api';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { useListTokens } from '../utils/hooks';

export function Home({ setListToken }) {
	const [userTokenInput, setUserTokenInput] = useState('');
	const [tokenToNavigate, setTokenToNavigate] = useState(null);
	const matchesMobileDevice = useMediaQuery('(max-width:700px)');
	const theme = useTheme();

	const [savedTokens, addToken, removeToken] = useListTokens();

	// Твоя функция handleClick (переименована в handleCreateListClick для ясности)
	function handleCreateListClick() {
		const token = generateToken();
		addToken(token);
		setListToken(token);
		setTokenToNavigate(token); // Для навигации после установки токена
	}

	// Твоя функция handleSumbit (переименована в handleJoinListSubmit)
	async function handleJoinListSubmit(e) {
		e.preventDefault();
		const trimmedToken = userTokenInput.trim();
		if (!trimmedToken) {
			Toastify({
				text: 'Please enter a token.',
				position: 'center',
				gravity: 'top',
				duration: 3000,
				style: { background: theme.palette.error.main },
			}).showToast();
			return;
		}

		const isValid = await validateToken(trimmedToken);
		if (isValid) {
			addToken(trimmedToken);
			setListToken(trimmedToken);
			setTokenToNavigate(trimmedToken); // Для навигации
		} else {
			Toastify({
				text: 'Sorry, this list token is not valid or the list does not exist.',
				position: 'center',
				gravity: 'top',
				duration: 3000,
				style: { background: theme.palette.error.main },
			}).showToast();
		}
		setUserTokenInput('');
	}

	const handleSavedTokenClick = (token) => {
		setListToken(token);
		setTokenToNavigate(token);
	};

	const handleRemoveTokenFromSaved = (event, tokenToRemove) => {
		event.stopPropagation(); // Предотвращаем клик по ListItemButton
		if (
			window.confirm(
				`Remove list "${tokenToRemove}" from your browser's memory? The list data itself will not be deleted.`,
			)
		) {
			removeToken(tokenToRemove);
		}
	};

	if (tokenToNavigate) {
		return <Navigate to="/list" replace={true} />;
	}

	return (
		<Stack
			direction="column"
			justifyContent="center"
			alignItems="center"
			spacing={matchesMobileDevice ? 3 : 4}
			sx={{ width: '100%', p: 2, mt: { xs: 2, md: 4 } }} // Адаптивный отступ сверху
		>
			<img
				src={logo}
				alt="ShopSmart Logo"
				width={matchesMobileDevice ? '160' : '220'}
			/>{' '}
			{/* Немного уменьшил лого */}
			<Typography
				variant={matchesMobileDevice ? 'h6' : 'h5'} // Сделал текст чуть меньше
				textAlign="center"
				gutterBottom
				sx={{
					fontWeight: 'regular',
					maxWidth: '550px',
					color: 'text.secondary',
				}} // Сделал текст второстепенным
			>
				The list that knows when it's time to stock up!
			</Typography>
			<Paper
				elevation={2}
				sx={{
					p: { xs: 2, sm: 3 },
					width: '100%',
					maxWidth: '450px',
					borderRadius: theme.shape.borderRadius,
				}}
			>
				<Stack gap={2} alignItems="center">
					<Typography
						variant={matchesMobileDevice ? 'h6' : 'h5'}
						component="h2"
					>
						Create a new shopping list
					</Typography>
					<Button
						type="button"
						variant="contained"
						size="large"
						onClick={handleCreateListClick}
						fullWidth
					>
						Create List
					</Button>
				</Stack>
			</Paper>
			<Typography
				variant="body1"
				sx={{ fontWeight: 'medium', color: 'text.secondary' }}
			>
				{/* Изменил на body1 для меньшего акцента */}- OR -
			</Typography>
			<Paper
				elevation={2}
				sx={{
					p: { xs: 2, sm: 3 },
					width: '100%',
					maxWidth: '450px',
					borderRadius: theme.shape.borderRadius,
				}}
			>
				<Box
					component="form"
					onSubmit={handleJoinListSubmit}
					sx={{ width: '100%' }}
				>
					<Stack gap={2} alignItems="center">
						<Typography
							variant={matchesMobileDevice ? 'h6' : 'h5'}
							component="h2"
						>
							Join an existing list
						</Typography>
						<TextField
							type="text"
							id="tokenInput"
							label="Enter three word token"
							variant="outlined"
							value={userTokenInput}
							onChange={(event) => setUserTokenInput(event.target.value)}
							fullWidth
							size={matchesMobileDevice ? 'small' : 'medium'}
						/>
						<Button
							variant="contained"
							color="secondary"
							size="large"
							type="submit"
							fullWidth
						>
							Join List
						</Button>
					</Stack>
				</Box>
			</Paper>
			{savedTokens.length > 0 && (
				<Paper
					elevation={2}
					sx={{
						p: { xs: 2, sm: 3 },
						mt: 3,
						width: '100%',
						maxWidth: '450px',
						borderRadius: theme.shape.borderRadius,
					}}
				>
					<Typography
						variant="h6"
						component="h2"
						gutterBottom
						textAlign="center"
					>
						My Previously Used Lists
					</Typography>
					<List dense={matchesMobileDevice}>
						{savedTokens.map((token, index) => (
							<React.Fragment key={token}>
								<ListItem
									disablePadding
									secondaryAction={
										<IconButton
											edge="end"
											aria-label={`Remove token ${token} from saved lists`}
											onClick={(e) => handleRemoveTokenFromSaved(e, token)}
											title="Remove from this browser's memory"
										>
											<DeleteOutlineIcon fontSize="small" color="action" />
										</IconButton>
									}
								>
									<ListItemButton
										onClick={() => handleSavedTokenClick(token)}
										title={`Open list: ${token}`}
										sx={{ borderRadius: theme.shape.borderRadius - 4 }}
									>
										<ListItemIcon sx={{ minWidth: '36px' }}>
											<OpenInNewIcon color="primary" fontSize="small" />
										</ListItemIcon>
										<ListItemText
											primary={token}
											primaryTypographyProps={{
												fontWeight: 'medium',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										/>
									</ListItemButton>
								</ListItem>
								{index < savedTokens.length - 1 && <Divider component="li" />}
							</React.Fragment>
						))}
					</List>
					<Typography
						variant="caption"
						display="block"
						textAlign="center"
						sx={{ mt: 1.5, color: 'text.secondary' }}
					>
						These tokens are stored in your browser.
					</Typography>
				</Paper>
			)}
		</Stack>
	);
}
