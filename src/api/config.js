import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Используем переменные окружения Vite для конфигурации Firebase
const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY,
	authDomain: import.meta.env.VITE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_APP_ID,
	measurementId: import.meta.env.VITE_MEASUREMENT_ID, // Этот может быть опциональным
};

// Проверка, что все переменные окружения загрузились (для отладки)
// console.log('Firebase Config being used:', firebaseConfig);
// if (!firebaseConfig.apiKey) {
// 	console.error("Firebase API Key is missing! Check your .env file and Netlify environment variables.");
// }

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
