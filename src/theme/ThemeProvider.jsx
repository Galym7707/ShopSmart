import { useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
	createTheme,
	responsiveFontSizes,
	ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';

// Импортируем всё из themeSettings.js
import { palette as importedPalette, typography, shape, componentsOverrides } from './themeSettings';

export const ThemeProvider = ({ children }) => {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const mode = prefersDarkMode ? 'dark' : 'light';

	const theme = useMemo(() => {
		// Создаем палитру с учетом mode
		const currentPalette = {
			...importedPalette, // Берем основные цвета из импортированной палитры
			mode: mode, // Устанавливаем текущий режим
			// Переопределяем background и text для темного/светлого режима,
			// используя значения из importedPalette, которые уже настроены для dark/light
			background: {
				default: mode === 'dark' ? importedPalette.background.defaultDark : importedPalette.background.default,
				paper: mode === 'dark' ? importedPalette.background.paperDark : importedPalette.background.paper,
			},
			text: {
				primary: mode === 'dark' ? importedPalette.text.primaryDark : importedPalette.text.primary,
				secondary: mode === 'dark' ? importedPalette.text.secondaryDark : importedPalette.text.secondary,
				disabled: mode === 'dark' ? importedPalette.text.disabledDark : importedPalette.text.disabled,
			},
            divider: mode === 'dark' ? importedPalette.dividerDark : importedPalette.divider,
            // Убедимся что grey передается (он уже есть внутри importedPalette)
            // grey: importedPalette.grey, // Нет необходимости, если grey уже часть importedPalette
		};

		let themeInstance = createTheme({
			palette: currentPalette,
			typography,
			shape,
			components: componentsOverrides(mode), // Передаем mode в componentsOverrides
		});
		
		themeInstance = responsiveFontSizes(themeInstance);
		return themeInstance;

	}, [mode]);

	return (
		<MUIThemeProvider theme={theme}>
			<CssBaseline enableColorScheme />
			{children}
		</MUIThemeProvider>
	);
};