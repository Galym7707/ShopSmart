import './ListItem.css';

import {
	ListItem,
	ListItemText,
	Checkbox,
	Chip,
	IconButton,
	Container,
	useMediaQuery,
	useTheme,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';

export function ListItemComponent({
	name,
	itemId,
	urgency,
	isDefaultChecked,
	setIsChecked,
	setCheckedItemId,
	onDeleteClick,
	item,
}) {
	const theme = useTheme();
	const matchesMobileDevice = useMediaQuery('(max-width:600px)');
	const colorByUrgency = {
		soon: theme.palette.secondary.dark,
		'kind of soon': theme.palette.primary.dark,
		'not soon': theme.palette.tertiary.dark,
		inactive: 'black',
		overdue: '#7f0000',
	};

	const urgencyColor = colorByUrgency[urgency];
	const dateLastPurchasedFormatted = item.dateLastPurchased
		? formatDate(item.dateLastPurchased)
		: 'N/A';
	const additionalItemInfo = `Last Purchased: ${dateLastPurchasedFormatted} • Total Purchases: ${item.totalPurchases}`;

	function formatDate(timestamp) {
		const date = timestamp.toDate();
		const month = (1 + date.getMonth()).toString().padStart(2, '0'); // add 1 because Months are zero-offset in JS
		const day = date.getDate().toString().padStart(2, '0');
		const year = date.getFullYear().toString().substring(2);

		return `${month}/${day}/${year}`;
	}
	function clickHandler(event, itemId) {
		setIsChecked(event.target.checked);
		setCheckedItemId(itemId);
	}

	return (
		<ListItem
			disablePadding={matchesMobileDevice ? true : null}
			sx={{
				'&': {
					display: 'flex',
					justifyContent: 'space-between',
				},
			}}
		>
			<Container
				sx={{
					'&': {
						display: 'flex',
						alignItems: 'center',
						padding: '0',
						margin: '0',
						maxWidth: '50%',
					},
				}}
			>
				<Checkbox
					id={itemId}
					edge="start"
					defaultChecked={isDefaultChecked}
					tabIndex={-1}
					disableRipple
					inputProps={{ 'aria-labelledby': `checkbox-liist-label=${name}` }}
					onClick={(event) => {
						clickHandler(event, itemId);
					}}
				/>
				<ListItemText
					id={itemId}
					primary={name}
					secondary={additionalItemInfo}
					secondaryTypographyProps={{
						fontSize: matchesMobileDevice ? 'small' : 'medium',
					}}
					primaryTypographyProps={{
						fontSize: matchesMobileDevice ? 'small' : 'medium',
					}}
					sx={{
						'&': {
							marginLeft: '10px',
						},
					}}
				/>
			</Container>
			<Chip
				size="small"
				label={urgency}
				sx={{
					'&': {
						backgroundColor: `${urgencyColor}`,
						color: 'white',
						width: '90px',
					},
				}}
			/>
			<IconButton
				edge="end"
				aria-label="delete"
				onClick={() => {
					onDeleteClick(item);
				}}
			>
				<DeleteIcon />
			</IconButton>
		</ListItem>
	);
}
