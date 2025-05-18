import React, { useEffect, useState } from 'react'; // Ensure React is imported
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useParams,
	useNavigate,
} from 'react-router-dom';

import { AddItem, Home, Layout, List } from './views';
import { getItemData, streamListItems } from './api'; // getItemData is used
import { useStateWithStorage } from './utils';
import { ThemeProvider } from './theme/ThemeProvider';

// Component-wrapper for reading token from URL and setting it
function JoinListTokenSetter({ setListToken }) {
	const { tokenFromUrl } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (tokenFromUrl) {
			// console.log('Token from URL:', tokenFromUrl);
			setListToken(tokenFromUrl);
			navigate('/list', { replace: true }); // Redirect to the list page
		} else {
			// If somehow landed on /join without a token, go home
			navigate('/', { replace: true });
		}
	}, [tokenFromUrl, setListToken, navigate]);

	return null; // This component does not render anything itself
}

export function App() {
	const [data, setData] = useState([]); // Holds the current list items
	const [listToken, setListToken] = useStateWithStorage(
		null, // Default to no token
		'tcl-shopping-list-token', // Key for localStorage
	);

	useEffect(() => {
		if (!listToken) {
			setData([]); // Clear data if no token
			return;
		}

		// Subscribe to list items
		const unsubscribe = streamListItems(listToken, (snapshot) => {
			const nextData = snapshot.docs.map(getItemData); // Use getItemData for each doc
			setData(nextData);
		});

		// Cleanup subscription on component unmount or when listToken changes
		return () => unsubscribe();
	}, [listToken]);

	return (
		<ThemeProvider>
			<Router>
				<Routes>
					<Route
						path="/join/:tokenFromUrl" // Route for joining a list via URL
						element={<JoinListTokenSetter setListToken={setListToken} />}
					/>
					<Route
						path="/"
						element={
							<Layout listToken={listToken} setListToken={setListToken} />
						} // Main layout
					>
						<Route
							index // Default route for "/"
							element={
								listToken ? (
									<Navigate to="/list" replace /> // If token exists, go to list
								) : (
									<Home setListToken={setListToken} /> // Else, show Home page
								)
							}
						/>
						<Route
							path="list"
							element={
								listToken ? (
									<List data={data} listToken={listToken} /> // Pass data to List
								) : (
									<Navigate to="/" replace /> // If no token, redirect to Home
								)
							}
						/>
						<Route
							path="add-item"
							element={
								listToken ? (
									// Pass current list data to AddItem for duplicate checking
									<AddItem listToken={listToken} data={data} />
								) : (
									<Navigate to="/" replace /> // If no token, redirect to Home
								)
							}
						/>
						{/* Catch-all route for undefined paths, redirects to Home */}
						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</Router>
		</ThemeProvider>
	);
}
