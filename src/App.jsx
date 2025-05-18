import React, { useEffect, useState } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useParams,
	useNavigate,
} from 'react-router-dom';

import { MyLists } from './views/MyLists'; // Импортируем MyLists
import { AddItem, Home, Layout, List } from './views';
import { getItemData, streamListItems } from './api';
import { useStateWithStorage, useListTokens } from './utils'; // useListTokens импортирован
import { ThemeProvider } from './theme/ThemeProvider';

function JoinListTokenSetter({ setListToken }) {
	const { tokenFromUrl } = useParams();
	const navigate = useNavigate();
	// eslint-disable-next-line no-unused-vars
	const [_, addToken] = useListTokens(); // Используем addToken здесь

	useEffect(() => {
		if (tokenFromUrl) {
			addToken(tokenFromUrl); // Сохраняем токен при переходе по прямой ссылке
			setListToken(tokenFromUrl);
			navigate('/list', { replace: true });
		} else {
			navigate('/', { replace: true });
		}
	}, [tokenFromUrl, setListToken, navigate, addToken]);

	return null;
}

export function App() {
	const [data, setData] = useState([]);
	const [listToken, setListToken] = useStateWithStorage(
		null,
		'tcl-shopping-list-token',
	);

	useEffect(() => {
		if (!listToken) {
			setData([]);
			return;
		}
		const unsubscribe = streamListItems(listToken, (snapshot) => {
			const nextData = snapshot.docs.map(getItemData);
			setData(nextData);
		});
		return () => unsubscribe();
	}, [listToken]);

	return (
		<ThemeProvider>
			<Router>
				<Routes>
					<Route
						path="/join/:tokenFromUrl"
						element={<JoinListTokenSetter setListToken={setListToken} />}
					/>
					<Route
						path="/"
						element={
							<Layout listToken={listToken} setListToken={setListToken} />
						}
					>
						<Route
							index
							element={
								listToken ? (
									<Navigate to="/list" replace />
								) : (
									<Home setListToken={setListToken} />
								)
							}
						/>
						<Route
							path="list"
							element={
								listToken ? (
									<List data={data} listToken={listToken} />
								) : (
									<Navigate to="/" replace />
								)
							}
						/>
						<Route
							path="add-item"
							element={
								listToken ? (
									<AddItem listToken={listToken} data={data} />
								) : (
									<Navigate to="/" replace />
								)
							}
						/>
						{/* Маршрут для MyLists */}
						<Route
							path="my-lists"
							element={<MyLists setListToken={setListToken} />}
						/>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</Router>
		</ThemeProvider>
	);
}
