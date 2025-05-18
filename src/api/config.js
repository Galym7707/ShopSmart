import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyCLxMMcvDbg_Xt8INp4qv8APBy_2RNOwdc',
	authDomain: 'jg-smart-shopping-list.firebaseapp.com',
	projectId: 'jg-smart-shopping-list',
	storageBucket: 'jg-smart-shopping-list.appspot.com',
	messagingSenderId: '968416180323',
	appId: '1:968416180323:web:c3693ca077837394c3e056',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
