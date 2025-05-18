import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Paper,
	Button,
	Divider,
	useTheme,
	IconButton,
	Container,
} from '@mui/material';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useListTokens } from '../utils/hooks';

export function MyLists({ setListToken }) {
	// addToken здесь не используется, поэтому убираем его из деструктуризации
	// eslint-disable-next-line no-unused-vars
	const [savedTokens, _, removeToken] = useListTokens(); // Используем _ для неиспользуемой переменной addToken
	const navigate = useNavigate();
	const theme = useTheme();

	const handleTokenClick = (token) => {
		setListToken(token);
		navigate('/list');
	};

	const handleRemoveToken = (event, tokenToRemove) => {
		event.stopPropagation();
		if (
			window.confirm(
				`Are you sure you want to remove the list "${tokenToRemove}" from this browser's memory? The list data itself will not be deleted.`,
			)
		) {
			removeToken(tokenToRemove);
		}
	};

	const handleGoHome = () => {
		navigate('/');
	};

	return (
		<Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
			<Paper
				elevation={3}
				sx={{
					p: { xs: 2, sm: 3, md: 4 },
					borderRadius: theme.shape.borderRadius,
					bgcolor: 'background.paper',
				}}
			>
				<Typography
					variant="h4"
					component="h1"
					gutterBottom
					textAlign="center"
					sx={{ mb: 3 }}
				>
					My Saved Lists
				</Typography>

				{savedTokens.length > 0 ? (
					<List>
						{savedTokens.map((token, index) => (
							<React.Fragment key={token}>
								<ListItem
									disablePadding
									secondaryAction={
										<IconButton
											edge="end"
											aria-label={`Remove token ${token} from saved lists`}
											onClick={(e) => handleRemoveToken(e, token)}
											title="Remove from this browser's memory"
										>
											<DeleteForeverIcon color="action" />
										</IconButton>
									}
									sx={{ mb: 1 }}
								>
									<ListItemButton
										onClick={() => handleTokenClick(token)}
										sx={{ borderRadius: theme.shape.borderRadius - 4 }}
										title={`Open list: ${token}`}
									>
										<ListItemIcon sx={{ minWidth: '40px' }}>
											<ShoppingBasketIcon color="primary" />
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
								{index < savedTokens.length - 1 && <Divider sx={{ my: 1 }} />}
							</React.Fragment>
						))}
					</List>
				) : (
					<Typography
						textAlign="center"
						color="text.secondary"
						sx={{ my: 4, fontStyle: 'italic' }}
					>
						You haven't created or joined any lists yet using this browser.{' '}
						<br />
						Your recently used list tokens will appear here.
					</Typography>
				)}
				<Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
					<Button
						variant="outlined"
						onClick={handleGoHome}
						startIcon={<AddCircleOutlineIcon />}
						size="large"
					>
						Create or Join a New List
					</Button>
				</Box>
			</Paper>
		</Container>
	);
}
