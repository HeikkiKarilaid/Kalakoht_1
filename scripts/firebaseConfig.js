import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCxZQtQ2wuTwyCnqlGambYrvDsp5YC2DZ4',
  authDomain: 'kalakoht-d1ba4.firebaseapp.com',
  projectId: 'kalakoht-d1ba4',
  storageBucket: 'kalakoht-d1ba4.appspot.com',
  messagingSenderId: '328621631436',
  appId: '1:328621631436:web:20779a64b6eaf7a10d9f69',
  measurementId: 'G-E8Q0HHT50Q',
  databaseURL:
    'https://kalakoht-d1ba4-default-rtdb.europe-west1.firebasedatabase.app/',
};

export const app = initializeApp(firebaseConfig);
