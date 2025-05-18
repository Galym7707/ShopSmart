import { useState, useEffect } from 'react';

/**
 * Set some state in React, and also persist that value in localStorage.
 * @param {any} initialValue The initial value to store in localStorage and React state.
 * @param {string} storageKey The key of the value in localStorage.
 */
export function useStateWithStorage(initialValue, storageKey) {
	const [value, setValue] = useState(() => {
		try {
			const currentValue = localStorage.getItem(storageKey);
			if (currentValue === 'null' || currentValue === 'undefined')
				return initialValue;
			return currentValue ? JSON.parse(currentValue) : initialValue;
		} catch (error) {
			// console.warn(`Error reading localStorage key “${storageKey}”:`, error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			if (value === null || value === undefined) {
				localStorage.removeItem(storageKey);
			} else {
				localStorage.setItem(storageKey, JSON.stringify(value));
			}
		} catch (error) {
			// console.warn(`Error setting localStorage key “${storageKey}”:`, error);
		}
	}, [storageKey, value]);

	return [value, setValue];
}

/**
 * Custom hook to manage a list of unique tokens in localStorage.
 * @param {string} storageKey The key for storing the list of tokens in localStorage.
 * @returns {[string[], Function, Function]} A tuple containing the array of tokens,
 * a function to add a new token,
 * and a function to remove a token.
 */
export function useListTokens(storageKey = 'listTokens') {
	const [tokens, setTokens] = useState(() => {
		try {
			const current = localStorage.getItem(storageKey);
			return current ? JSON.parse(current) : [];
		} catch (error) {
			// console.warn(`Error reading localStorage key “${storageKey}”:`, error);
			return [];
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(tokens));
		} catch (error) {
			// console.warn(`Error setting localStorage key “${storageKey}”:`, error);
		}
	}, [tokens, storageKey]);

	const addToken = (newToken) => {
		if (
			typeof newToken === 'string' &&
			newToken.trim() !== '' &&
			!tokens.includes(newToken.trim())
		) {
			setTokens((prevTokens) => [...prevTokens, newToken.trim()]);
		}
	};

	const removeToken = (tokenToRemove) => {
		// ESLint: 'removeToken' is assigned a value but never used. (Это нормально пока)
		setTokens((prevTokens) =>
			prevTokens.filter((token) => token !== tokenToRemove),
		);
	};

	return [tokens, addToken, removeToken];
}
