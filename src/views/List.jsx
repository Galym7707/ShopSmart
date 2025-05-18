import { useState, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ListItemComponent } from '../components';
import { updateItem, deleteItem } from '../api/firebase.js';
import { comparePurchaseUrgency } from '../utils/dates';
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
	Icon,
	useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import './List.css';

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function List({ data, listToken }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [checkedItemId, setCheckedItemId] = useState('');
	const [isChecked, setIsChecked] = useState(false);
	const [selectedItem, setSelectedItem] = useState('');
	const [open, setOpen] = useState(false);
	const matchesMobileDevice = useMediaQuery('(max-width:600px)');

	/*TO DO: Implement guard against user's accidental click. Currently the updated fields (dateLastPurchased and totalPurchases) in Firestore
	persist when user unchecks item.
	TO DO: Consider adding option for user to navigate home to create a new list.
	TO DO: Redirect user to Add Item view if list is empty.*/

	useEffect(() => {
		if (isChecked) {
			updateItem(listToken, checkedItemId);
		}
	}, [isChecked, listToken, checkedItemId]);

	const filteredList = data.filter((item) => {
		if (searchTerm === '') {
			return item;
		} else if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
			return item;
		}
	});

	const sortedList = comparePurchaseUrgency(filteredList);

	const renderedList = sortedList.map((item) => (
		<ListItemComponent
			name={item.name}
			isDefaultChecked={item.isDefaultChecked}
			key={item.id}
			itemId={item.id}
			urgency={item.urgency}
			setCheckedItemId={setCheckedItemId}
			setIsChecked={setIsChecked}
			onDeleteClick={handleOpenDialog}
			item={item}
		/>
	));

	const listIsEmpty = Boolean(!data.length);
	const noMatchingItems = Boolean(!filteredList.length);

	//Delete Item functionality with showing and closing modal

	function handleOpenDialog(item) {
		setSelectedItem(item);
		setOpen(true);
	}

	function handleCloseDialog() {
		setOpen(false);
	}

	function handleDeleteItem() {
		deleteItem(listToken, selectedItem.id);
		setOpen(false);
	}

	return (
		<Box minHeight="100vh">
			{listIsEmpty ? (
				<Box display="flex" flexDirection="column">
					<Typography variant="h2" paddingTop="75px" paddingBottom="50px">
						Your list is currently empty.
					</Typography>
					{/* <Typography variant="body2">
						Add your first item by clicking the button below.
					</Typography> */}
					<Button
						type="button"
						variant="contained"
						size="large"
						href="/add-item"
						startIcon={<AddIcon />}
					>
						Add first item
					</Button>
				</Box>
			) : (
				<>
					<Container
						sx={{
							width: '100%',
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						<TextField
							id="outlined-search"
							label="Search for an item in your list"
							type="search"
							size={matchesMobileDevice ? 'small' : 'medium'}
							margin="normal"
							color="primary"
							error={noMatchingItems}
							helperText={
								noMatchingItems ? 'No items matching your search terms.' : null
							}
							sx={{
								width: matchesMobileDevice ? '100%' : '500px',
								minWidth: '250px',
							}}
							onChange={(event) => setSearchTerm(event.target.value)}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton aria-label="search icon" edge="end">
											<SearchIcon />
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
					</Container>

					<MuiListComponent
						sx={{
							'&': {
								width: matchesMobileDevice ? '80vw' : '60vw',
								margin: 'auto',
							},
						}}
					>
						{renderedList}
						{noMatchingItems && (
							<Container
								sx={{
									'&': {
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									},
								}}
							>
								<Link
									to="/add-item"
									state={{ itemUserSearchedFor: searchTerm }}
									style={{ color: 'inherit', textDecoration: 'none' }}
								>
									<Button
										type="button"
										variant="contained"
										size="large"
										startIcon={<AddIcon />}
									>
										<Typography>
											Add <span id="prospectiveItemName">{searchTerm}</span> to
											your list?
										</Typography>
									</Button>
								</Link>
							</Container>
						)}
					</MuiListComponent>
				</>
			)}

			<Dialog
				open={open}
				TransitionComponent={Transition}
				keepMounted
				onClose={handleCloseDialog}
				aria-describedby="confirm-delete-dialog-slide-description"
			>
				<DialogTitle>{'Delete this item from your list?'}</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirm-delete-dialog-slide-description">
						Are you sure you want to delete{' '}
						<span id="dialogItemName">{selectedItem.name}</span>? This will
						permanently remove the item and its purchase history from your list.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteItem}>Delete</Button>
					<Button onClick={handleCloseDialog}>Cancel</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
