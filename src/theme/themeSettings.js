// Палитра с высоким контрастом
const highContrastPalette = {
	primary: {
		main: '#0D47A1', // Глубокий синий
		light: '#1976D2',
		dark: '#002171',
		contrastText: '#FFFFFF',
	},
	secondary: {
		main: '#00796B', // Темный тил/бирюза
		light: '#26A69A',
		dark: '#004D40',
		contrastText: '#FFFFFF',
	},
	tertiary: {
		main: '#FF6F00', // Яркий оранжевый
		contrastText: '#FFFFFF',
	},
	background: {
		default: '#F5F5F5',
		paper: '#FFFFFF',
		defaultDark: '#121212',
		paperDark: '#1E1E1E',
	},
	text: {
		primary: '#1C1C1E',
		secondary: '#4A4A4A',
		disabled: '#AEAEB2',
		primaryDark: '#F2F2F7',
		secondaryDark: '#C7C7CC',
		disabledDark: '#757575',
	},
	divider: '#DCDCDC',
	dividerDark: '#3A3A3C',
	grey: {
		50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 300: '#e0e0e0',
		400: '#bdbdbd', 500: '#9e9e9e', 600: '#757575', 700: '#616161',
		800: '#424242', 900: '#212121', A100: '#d5d5d5', A200: '#aaaaaa',
		A400: '#303030', A700: '#616161',
	},
	success: { main: '#2E7D32', contrastText: '#FFFFFF' },
	error: { main: '#C62828', contrastText: '#FFFFFF' },
	warning: { main: '#EF6C00', contrastText: '#FFFFFF' },
	info: { main: '#0277BD', contrastText: '#FFFFFF' },
};

const fontFamily = `'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

export const typography = {
	fontFamily: fontFamily,
	fontSize: 15,
	fontWeightLight: 300, fontWeightRegular: 400, fontWeightMedium: 500, fontWeightBold: 700,
	h1: { fontFamily: fontFamily, fontSize: '2.7rem', fontWeight: 700, lineHeight: 1.2 },
	h2: { fontFamily: fontFamily, fontSize: '2.1rem', fontWeight: 700, lineHeight: 1.25 },
	h3: { fontFamily: fontFamily, fontSize: '1.7rem', fontWeight: 600, lineHeight: 1.3 },
	h4: { fontFamily: fontFamily, fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.35 },
	h5: { fontFamily: fontFamily, fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.4 },
	h6: { fontFamily: fontFamily, fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.45 },
	subtitle1: { fontSize: '1rem', fontWeight: 500 },
	subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
	body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.65 },
	body2: { fontSize: '0.9rem', fontWeight: 400, lineHeight: 1.55 },
	button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.5px', fontSize: '0.95rem' },
	caption: { fontSize: '0.8rem', fontWeight: 400 },
	overline: { fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
};

export const palette = highContrastPalette;

export const shape = {
	borderRadius: 8,
};

export const componentsOverrides = (mode) => ({
	MuiCssBaseline: {
		styleOverrides: `
			body {
				transition: background-color 0.3s ease-in-out;
			}
			::-webkit-scrollbar {
				width: 10px;
				height: 10px;
			}
			::-webkit-scrollbar-track {
				background: ${mode === 'dark' ? highContrastPalette.background.paperDark : highContrastPalette.background.default};
			}
			::-webkit-scrollbar-thumb {
				background-color: ${mode === 'dark' ? highContrastPalette.grey[700] : highContrastPalette.grey[400]};
				border-radius: 5px;
			}
			::-webkit-scrollbar-thumb:hover {
				background-color: ${mode === 'dark' ? highContrastPalette.primary.light : highContrastPalette.primary.main};
			}
		`,
	},
	MuiButton: {
		defaultProps: {	disableElevation: true,	},
		styleOverrides: {
			root: {	borderRadius: shape.borderRadius, padding: '10px 24px',	},
			containedPrimary: {
                backgroundColor: highContrastPalette.primary.main,
				color: highContrastPalette.primary.contrastText,
				'&:hover': { backgroundColor: highContrastPalette.primary.dark, },
			},
			containedSecondary: {
                backgroundColor: highContrastPalette.secondary.main,
				color: highContrastPalette.secondary.contrastText,
				'&:hover': { backgroundColor: highContrastPalette.secondary.dark, },
			},
			outlinedPrimary: {
				borderColor: highContrastPalette.primary.main, color: highContrastPalette.primary.main,
				'&:hover': { backgroundColor: `${highContrastPalette.primary.main}1A`, borderColor: highContrastPalette.primary.dark, },
			},
            outlinedSecondary: {
				borderColor: highContrastPalette.secondary.main, color: highContrastPalette.secondary.main,
				'&:hover': { backgroundColor: `${highContrastPalette.secondary.main}1A`, borderColor: highContrastPalette.secondary.dark, },
			},
		},
	},
	MuiAppBar: {
        defaultProps: { elevation: 1, },
		styleOverrides: {
			root: {
				backgroundColor: mode === 'dark' ? highContrastPalette.background.paperDark : highContrastPalette.primary.main,
                color: mode === 'dark' ? highContrastPalette.text.primaryDark : highContrastPalette.primary.contrastText,
			},
		},
	},
	MuiPaper: { styleOverrides: { root: {	backgroundImage: 'none', },	}, },
	MuiOutlinedInput: {
		styleOverrides: {
			root: {
				borderRadius: shape.borderRadius,
                backgroundColor: mode === 'dark' ? highContrastPalette.background.paperDark : highContrastPalette.background.paper,
				'& .MuiOutlinedInput-notchedOutline': { borderColor: mode === 'dark' ? highContrastPalette.dividerDark : highContrastPalette.divider, },
				'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: highContrastPalette.primary.main, },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: highContrastPalette.primary.main, borderWidth: '2px', },
			},
            input: { color: mode === 'dark' ? highContrastPalette.text.primaryDark : highContrastPalette.text.primary, }
		},
	},
    MuiFormLabel: {
        styleOverrides: {
            root: {
                color: mode === 'dark' ? highContrastPalette.text.secondaryDark : highContrastPalette.text.secondary,
                '&.Mui-focused': { color: highContrastPalette.primary.main, }
            }
        }
    },
	MuiListItemButton: {
		styleOverrides: {
			root: {
				borderRadius: shape.borderRadius,
				'&:hover': { backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',}
			}
		}
	},
    MuiCheckbox: {
        styleOverrides: {
            root: {
                color: mode === 'dark' ? highContrastPalette.text.secondaryDark : highContrastPalette.text.secondary,
                '&.Mui-checked': { color: highContrastPalette.primary.main, }
            }
        }
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                 color: mode === 'dark' ? highContrastPalette.text.primaryDark : highContrastPalette.text.primary,
                '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)', }
            }
        }
    },
    MuiChip: { // Стили для Chip (используется для токена)
        styleOverrides: {
            root: {
                fontWeight: 'medium',
            },
            icon: { // Чтобы иконка внутри Chip наследовала цвет
                color: 'inherit !important',
            }
        }
    }
});