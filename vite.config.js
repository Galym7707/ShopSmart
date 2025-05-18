import { defineConfig } from 'vite';
import eslint from '@nabla/vite-plugin-eslint'; // Оставим ESLint, если он не вызывает ошибок сборки
import react from '@vitejs/plugin-react'; // Это основной плагин для React
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa'; // PWA плагин пока оставим, но если ошибка сохранится, его можно будет временно отключить

// PWAConfig можно оставить как есть, если он не вызывает проблем
// Если будут проблемы, можно его временно закомментировать вместе с VitePWA(PWAConfig) в plugins
const PWAConfig = {
	includeAssets: ['favicon.ico', 'robots.txt'], // Убедись, что эти файлы есть в public или корне
	manifest: {
		short_name: 'ShopSmart', // Используем твое новое имя
		name: 'ShopSmart - Smart Shopping List',
		description:
			'A smart shopping list that learns your purchase habits and makes suggestions.',
		icons: [
			{
				src: 'favicon.ico',
				sizes: '64x64 32x32 24x24 16x16',
				type: 'image/x-icon',
			},
			{ src: 'logo192.png', type: 'image/png', sizes: '192x192' }, // Убедись, что logo192.png есть в public
			{ src: 'logo512.png', type: 'image/png', sizes: '512x512' }, // Убедись, что logo512.png есть в public
		],
		start_url: '.',
		display: 'standalone',
		theme_color: '#0D47A1', // Из нашей новой темы
		background_color: '#F5F5F5', // Из нашей новой темы
	},
	// Упростим или уберем workbox настройки, если они не критичны сейчас
	// workbox: {
	// 	globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
	// },
};

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: 'dist', // Это правильно для Netlify
		target: 'esnext',
		// commonjsOptions: { include: [] }, // Закомментируем, скорее всего не нужно с Vite 4+
		// rollupOptions: { // Эту сложную секцию manualChunks пока полностью уберем для упрощения
		// 	output: {
		// 		manualChunks: (id) => { /* ... */ },
		// 	},
		// },
	},
	// optimizeDeps: { // Эту секцию тоже пока полностью уберем, Vite 4+ обычно хорошо справляется сам
	// 	disabled: false,
	// 	esbuildOptions: { /* ... */ },
	// },
	plugins: [
		eslint({ fix: true }), // Добавим fix: true, может помочь с автоисправлениями при сборке
		react(),
		svgr(),
		VitePWA(PWAConfig), // Если ошибка останется, первым делом попробуй закомментировать эту строку
	],
	// test: { /* секция test не влияет на build */ },
});
