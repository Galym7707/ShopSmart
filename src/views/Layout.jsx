import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
	useMediaQuery,
	useTheme,
	Button,
	Chip, // Для отображения токена
	Tooltip, // Для подсказки при наведении на токен
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout'; // Новая иконка
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share'; // Иконка для "поделиться"
// import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Можно использовать для кнопки "копировать" отдельно
import './Layout.css';

const APP_NAME = 'ShopSmart';

export function Layout({ listToken, setListToken }) {
	const [anchorElNav, setAnchorElNav] = useState(null);
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)'); // Это определит текущую системную тему
	const theme = useTheme();
	const navigate = useNavigate();
	const [copied, setCopied] = useState(false);

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

	const handleCopyToClipboard = () => {
		if (listToken) {
			const shareableLink = `${window.location.origin}/join/${listToken}`;
			navigator.clipboard.writeText(shareableLink).then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2500); // Увеличим время отображения "Copied!"
			}).catch(err => {
				console.error('Failed to copy link: ', err);
				// Можно добавить уведомление об ошибке копирования
				alert('Could not copy link to clipboard. Please copy the token manually.');
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
		<Paper sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
			<AppBar
				position="static"
				elevation={1}
				sx={{
					// backgroundColor в themeSettings.js для MuiAppBar теперь управляет этим
				}}
			>
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

						{/* Мобильное меню и лого */}
						<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
							{listToken && (
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
							)}
							{/* Логотип для мобильных по центру */}
							<Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', pr: listToken ? '48px' : '0px' /* Компенсация ширины иконки меню */ }}>
								<NavLink
									to="/"
									onClick={listToken ? handleGoHomeAndClearToken : null}
									style={navLinkBaseStyle}
								>
									<ShoppingCartCheckoutIcon sx={{ mr: 0.5, fontSize: '1.8rem' }} />
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
						{/* Мобильное меню выпадающее */}
						{listToken && (
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
								<MenuItem onClick={handleCloseNavMenu}>
									<NavLink to="/list" className="Menu-nav-link">
										My List
									</NavLink>
								</MenuItem>
								<MenuItem onClick={handleCloseNavMenu}>
									<NavLink to="/add-item" className="Menu-nav-link">
										Add Item
									</NavLink>
								</MenuItem>
								{/* Отображение и копирование токена/ссылки в мобильном меню */}
								{listToken && (
									<MenuItem onClick={() => { handleCopyToClipboard(); handleCloseNavMenu(); }}>
										<ShareIcon sx={{ mr: 1, fontSize: '1.2em' }} />
										{copied ? "Link Copied!" : "Share List"}
									</MenuItem>
								)}
								<MenuItem onClick={handleGoHomeAndClearToken}>
									<HomeIcon sx={{ mr: 1, fontSize: '1.2em' }} />
									Home
								</MenuItem>
							</Menu>
						)}

						{/* Десктоп: Токен и Навигация */}
						{listToken && (
							<>
								<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} /> {/* Центральный заполнитель */}
								<Tooltip title={copied ? "Link Copied!" : "Click to copy shareable link"} placement="bottom">
									<Chip
										icon={<ShareIcon sx={{color: 'inherit !important'}} />} // Важно для цвета иконки
										label={`Share Token: ${listToken}`}
										onClick={handleCopyToClipboard}
										size="medium"
										sx={{
											mr: 2, // Отступ справа от токена
											display: { xs: 'none', md: 'flex' },
											backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.primary.light,
											color: theme.palette.mode === 'dark' ? theme.palette.text.primaryDark : theme.palette.primary.contrastText, // Для текста на primary.light
											cursor: 'pointer',
											'&:hover': {
												backgroundColor: theme.palette.secondary.main,
												color: theme.palette.secondary.contrastText,
												'.MuiChip-icon': {
													color: theme.palette.secondary.contrastText + ' !important',
												}
											},
											'.MuiChip-label': { // Увеличим читаемость токена
												fontWeight: 'bold',
											},
										}}
									/>
								</Tooltip>
								<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
									<NavLink to="/list" className="Nav-link" style={{ marginRight: theme.spacing(2) }}>
										My List
									</NavLink>
									<NavLink to="/add-item" className="Nav-link" style={{ marginRight: theme.spacing(2) }}>
										Add Item
									</NavLink>
									<Button
										onClick={handleGoHomeAndClearToken}
										startIcon={<HomeIcon />}
										sx={{
											color: 'inherit', // Цвет текста кнопки из AppBar
											fontWeight: 'bold',
											'&:hover': {
												backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : 'rgba(255, 255, 255, 0.2)', // Эффект при наведении
											},
										}}
									>
										Home
									</Button>
								</Box>
							</>
						)}
						{!listToken && <Box sx={{ flexGrow: 1 }} /> /* Если нет токена, просто заполнитель */}
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
					justifyContent: 'flex-start',
					alignItems: 'center',
					pt: { xs: 2, sm: 3, md: 4 }, // Адаптивные отступы
					pb: { xs: 3, sm: 4, md: 6 },
					width: '100%', // Занимаем всю ширину
				}}
			>
				<Outlet />
			</Container>

			<Box
				component="footer"
				sx={{
					py: 2.5, // Немного увеличили отступы
					px: 2,
					mt: 'auto',
					backgroundColor: theme.palette.mode === 'dark'
						? theme.palette.background.paperDark
						: theme.palette.grey[100], // Чуть светлее для футера
					textAlign: 'center',
					borderTop: `1px solid ${theme.palette.divider}`,
				}}
			>
				<Typography variant="body2" color="text.secondary">
					© {new Date().getFullYear()} {APP_NAME} - Your Smart Shopping Companion
				</Typography>
			</Box>
		</Paper>
	);
}