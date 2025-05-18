import { useEffect, useState } from 'react';
import {
	BrowserRouter as Router, // Переименовал для ясности, что это корневой Router
	Routes,
	Route,
	Navigate,
	useParams,
	useNavigate,
} from 'react-router-dom';

import { AddItem, Home, Layout, List } from './views';
import { getItemData, streamListItems } from './api';
import { useStateWithStorage } from './utils';
import { ThemeProvider } from './theme/ThemeProvider';

// Компонент-обертка для чтения токена из URL и установки его
function JoinListTokenSetter({ setListToken }) {
	const { tokenFromUrl } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (tokenFromUrl) {
			console.log('Token from URL:', tokenFromUrl);
			setListToken(tokenFromUrl);
			navigate('/list', { replace: true });
		} else {
			navigate('/', { replace: true });
		}
	}, [tokenFromUrl, setListToken, navigate]);

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
		const unsubscribe = streamListItems(listToken, (snapshot) => { // Сохраняем функцию отписки
			const nextData = getItemData(snapshot);
			setData(nextData);
		});
		return unsubscribe; // Отписываемся при размонтировании или смене listToken
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
						element={<Layout listToken={listToken} setListToken={setListToken} />}
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
									<AddItem listToken={listToken} />
								) : (
									<Navigate to="/" replace />
								)
							}
						/>
						<Route path="*" element={<Navigate to="/" replace />} />
					</Route>
				</Routes>
			</Router>
		</ThemeProvider>
	);
}