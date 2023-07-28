import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, child, get } from 'firebase/database';

import { renderMap } from './renderMap';
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
const logOff = document.querySelector('.sign-out');

initializeApp(firebaseConfig);

const auth = getAuth();
onAuthStateChanged(auth, user => {
  const uid = user.uid;

  // ...
  const dbRef = ref(getDatabase());
  //! Get user location and render on map
  get(child(dbRef, `users/${uid}`))
    .then(snapshot => {
      if (snapshot.exists()) {
        console.log(snapshot.val().username);
        const latitude = snapshot.val().coordinates.latitude;
        const longitude = snapshot.val().coordinates.longitude;
        const name = snapshot.val().username;
        //console.log(latitude, longitude, name);
        const coords = [latitude, longitude];
        renderMap(coords, name);
      } else {
        console.log('No data available');
      }
    })
    .catch(error => {
      console.error(error);
    });
});

//read coords

//! Logout
logOff.addEventListener('click', function () {
  //const auth = getAuth();
  signOut(auth)
    .then(() => {
      // Sign-out successful
      window.location.assign('index.html');
      console.log('signed out');
    })
    .catch(error => {
      // An error happened.
      console.log(error);
    });
});
