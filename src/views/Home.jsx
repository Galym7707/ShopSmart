import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // Удален RouterLink
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

import logo from '../logo.png';

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

	function handleCreateListClick() {
		const token = generateToken();
		addToken(token);
		setListToken(token);
		setTokenToNavigate(token);
	}

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
			setTokenToNavigate(trimmedToken);
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
		event.stopPropagation();
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
			sx={{ width: '100%', p: 2, mt: 2 }}
		>
			<img
				src={logo}
				alt="ShopSmart Logo"
				width={matchesMobileDevice ? '180' : '250'}
			/>

			<Typography
				variant={matchesMobileDevice ? 'h5' : 'h4'}
				textAlign="center"
				gutterBottom
				sx={{ fontWeight: 'medium', maxWidth: '600px' }}
			>
				The list that knows when it's time to stock up!
			</Typography>

			<Paper
				elevation={3}
				sx={{
					p: { xs: 2, sm: 3 },
					width: '100%',
					maxWidth: '500px',
					borderRadius: theme.shape.borderRadius,
				}}
			>
				<Stack gap={2} alignItems="center">
					<Typography
						variant={matchesMobileDevice ? 'h6' : 'h5'}
						component="h2"
					>
						Create a new shopping list.
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
				variant={matchesMobileDevice ? 'h6' : 'h5'}
				sx={{ fontWeight: 'medium' }}
			>
				- OR -
			</Typography>

			<Paper
				elevation={3}
				sx={{
					p: { xs: 2, sm: 3 },
					width: '100%',
					maxWidth: '500px',
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
							Join an existing list.
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
					elevation={3}
					sx={{
						p: { xs: 2, sm: 3 },
						mt: 3,
						width: '100%',
						maxWidth: '500px',
						borderRadius: theme.shape.borderRadius,
					}}
				>
					<Typography
						variant={matchesMobileDevice ? 'h6' : 'h5'}
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
											<DeleteOutlineIcon color="action" />
										</IconButton>
									}
								>
									<ListItemButton
										onClick={() => handleSavedTokenClick(token)}
										title={`Open list: ${token}`}
									>
										{/* ListItemIcon добавлен здесь */}
										<ListItemIcon sx={{ minWidth: '40px' }}>
											<OpenInNewIcon color="primary" />
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
								{index < savedTokens.length - 1 && <Divider />}
							</React.Fragment>
						))}
					</List>
					<Typography
						variant="caption"
						display="block"
						textAlign="center"
						sx={{ mt: 1, color: 'text.secondary' }}
					>
						These tokens are stored in your browser.
					</Typography>
				</Paper>
			)}
		</Stack>
	);
}
