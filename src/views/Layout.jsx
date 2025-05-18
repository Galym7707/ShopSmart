import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react'; // useEffect удален
import {
	Container,
	Typography,
	Paper,
	AppBar,
	Toolbar,
	Box,
	IconButton,
	Menu,
	MenuItem,
	// useMediaQuery, // Удален, так как prefersDarkMode не используется
	useTheme,
	Button,
	Chip,
	Tooltip,
	alpha, // Импортирован alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import ListAltIcon from '@mui/icons-material/ListAlt';
import './Layout.css';

const APP_NAME = 'ShopSmart';

export function Layout({ listToken, setListToken }) {
	const [anchorElNav, setAnchorElNav] = useState(null);
	const theme = useTheme();
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);
	// const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)'); // Удалено

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleGoHomeAndClearToken = () => {
		if (setListToken) {
			setListToken(null);
		}
		navigate('/');
		handleCloseNavMenu();
	};

	const handleGoToMyLists = () => {
		if (setListToken && listToken) {
			setListToken(null);
		}
		navigate('/my-lists');
		handleCloseNavMenu();
	};

	const handleCopyToClipboard = () => {
		if (listToken) {
			const shareableLink = `${window.location.origin}/join/${listToken}`;
			navigator.clipboard
				.writeText(shareableLink)
				.then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2500);
				})
				.catch((err) => {
					console.error('Failed to copy link: ', err);
					alert(
						'Could not copy link to clipboard. Please copy the token manually.',
					);
				});
		}
	};

	const navLinkBaseStyle = {
		textDecoration: 'none',
		color: 'inherit',
		display: 'flex',
		alignItems: 'center',
	};

	return (
		<Paper
			sx={{
				minHeight: '100dvh',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: 'background.default',
			}}
		>
			<AppBar position="static" elevation={1}>
				<Container maxWidth="lg">
					<Toolbar disableGutters>
						<NavLink
							to="/"
							onClick={listToken ? handleGoHomeAndClearToken : null}
							style={navLinkBaseStyle}
							title={`Go to ${APP_NAME} Home`}
						>
							<ShoppingCartCheckoutIcon
								sx={{
									display: { xs: 'none', md: 'flex' },
									mr: 1,
									fontSize: '2rem',
								}}
							/>
							<Typography
								variant="h5"
								noWrap
								component="span"
								sx={{
									mr: 2,
									display: { xs: 'none', md: 'flex' },
									fontFamily: theme.typography.h1.fontFamily,
									fontWeight: 700,
									letterSpacing: '.1rem',
								}}
							>
								{APP_NAME}
							</Typography>
						</NavLink>

						<Box
							sx={{
								flexGrow: 1,
								display: { xs: 'flex', md: 'none' },
								alignItems: 'center',
							}}
						>
							<IconButton
								size="large"
								aria-label="navigation menu"
								aria-controls="menu-appbar-mobile"
								aria-haspopup="true"
								onClick={handleOpenNavMenu}
								color="inherit"
							>
								<MenuIcon />
							</IconButton>
							<Box
								sx={{
									flexGrow: 1,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									pr: '48px',
								}}
							>
								<NavLink
									to="/"
									onClick={listToken ? handleGoHomeAndClearToken : null}
									style={navLinkBaseStyle}
								>
									<ShoppingCartCheckoutIcon
										sx={{ mr: 0.5, fontSize: '1.8rem' }}
									/>
									<Typography
										variant="h6"
										noWrap
										component="span"
										sx={{
											fontFamily: theme.typography.h1.fontFamily,
											fontWeight: 700,
											letterSpacing: '.1rem',
										}}
									>
										{APP_NAME}
									</Typography>
								</NavLink>
							</Box>
						</Box>
						<Menu
							id="menu-appbar-mobile"
							anchorEl={anchorElNav}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
							keepMounted
							transformOrigin={{ vertical: 'top', horizontal: 'left' }}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{ display: { xs: 'block', md: 'none' } }}
						>
							<MenuItem onClick={handleGoToMyLists}>
								<ListAltIcon sx={{ mr: 1, fontSize: '1.2em' }} />
								My Lists
							</MenuItem>
							{listToken && (
								<>
									<MenuItem
										onClick={() => {
											navigate('/list');
											handleCloseNavMenu();
										}}
									>
										<NavLink
											to="/list"
											className="Menu-nav-link"
											style={{
												textDecoration: 'none',
												color: 'inherit',
												width: '100%',
											}}
										>
											Current List
										</NavLink>
									</MenuItem>
									<MenuItem
										onClick={() => {
											navigate('/add-item');
											handleCloseNavMenu();
										}}
									>
										<NavLink
											to="/add-item"
											className="Menu-nav-link"
											style={{
												textDecoration: 'none',
												color: 'inherit',
												width: '100%',
											}}
										>
											Add Item
										</NavLink>
									</MenuItem>
									<MenuItem
										onClick={() => {
											handleCopyToClipboard();
											handleCloseNavMenu();
										}}
									>
										<ShareIcon sx={{ mr: 1, fontSize: '1.2em' }} />
										{copied ? 'Link Copied!' : 'Share List'}
									</MenuItem>
								</>
							)}
							<MenuItem onClick={handleGoHomeAndClearToken}>
								<HomeIcon sx={{ mr: 1, fontSize: '1.2em' }} />
								Home / New
							</MenuItem>
						</Menu>

						<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} />

						{listToken && (
							<Tooltip
								title={copied ? 'Link Copied!' : 'Click to copy shareable link'}
								placement="bottom"
							>
								<Chip
									icon={<ShareIcon sx={{ color: 'inherit !important' }} />}
									label={`Share: ${listToken}`}
									onClick={handleCopyToClipboard}
									size="medium"
									sx={{
										mr: 2,
										backgroundColor:
											theme.palette.mode === 'dark'
												? theme.palette.grey[700]
												: alpha(theme.palette.primary.light, 0.7),
										color:
											theme.palette.mode === 'dark'
												? theme.palette.text.primaryDark
												: theme.palette.primary.contrastText,
										cursor: 'pointer',
										'&:hover': {
											backgroundColor: theme.palette.secondary.main,
											color: theme.palette.secondary.contrastText,
											'.MuiChip-icon': {
												color:
													theme.palette.secondary.contrastText + ' !important',
											},
										},
										'.MuiChip-label': { fontWeight: 'medium' },
									}}
								/>
							</Tooltip>
						)}

						<Box
							sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}
						>
							<NavLink
								to="/my-lists"
								className="Nav-link"
								style={{ marginRight: theme.spacing(2) }}
								onClick={handleGoToMyLists}
							>
								My Lists
							</NavLink>

							{listToken && (
								<>
									<NavLink
										to="/list"
										className="Nav-link"
										style={{ marginRight: theme.spacing(2) }}
									>
										Current List
									</NavLink>
									<NavLink
										to="/add-item"
										className="Nav-link"
										style={{ marginRight: theme.spacing(2) }}
									>
										Add Item
									</NavLink>
								</>
							)}
							<Button
								onClick={handleGoHomeAndClearToken}
								startIcon={<HomeIcon />}
								sx={{
									color: 'inherit',
									fontWeight: 'bold',
									'&:hover': {
										backgroundColor:
											theme.palette.mode === 'dark'
												? theme.palette.grey[700]
												: alpha(theme.palette.common.white, 0.2),
									},
								}}
							>
								Home / New
							</Button>
						</Box>
					</Toolbar>
				</Container>
			</AppBar>

			<Container
				component="main"
				maxWidth="md"
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					pt: { xs: 2, sm: 3, md: 4 },
					pb: { xs: 3, sm: 4, md: 6 },
					width: '100%',
				}}
			>
				<Outlet />
			</Container>

			<Box
				component="footer"
				sx={{
					py: 2.5,
					px: 2,
					mt: 'auto',
					backgroundColor:
						theme.palette.mode === 'dark'
							? theme.palette.background.paperDark
							: theme.palette.grey[100],
					textAlign: 'center',
					borderTop: `1px solid ${theme.palette.divider}`,
				}}
			>
				<Typography variant="body2" color="text.secondary">
					© {new Date().getFullYear()} {APP_NAME} - Your Smart Shopping
					Companion
				</Typography>
			</Box>
		</Paper>
	);
}
