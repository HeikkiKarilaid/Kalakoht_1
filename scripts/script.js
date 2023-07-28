import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { app } from './firebaseConfig.js';
import { getDatabase, ref, set, update } from 'firebase/database';
import { getLocation } from './getLocation.js';
// const databaseURL =
//   'https://kalakoht-d1ba4-default-rtdb.europe-west1.firebasedatabase.app/';

const database = getDatabase(app);
const username = document.getElementById('username');
const email = document.getElementById('email');
const create = document.querySelector('.button-create');
const login = document.querySelector('.button-login');
const password = document.getElementById('password');
const auth = getAuth();
const loginError = document.getElementById('login-error-msg');

//! Create user
create.addEventListener('click', e => {
  e.preventDefault();
  const name = username.value;
  const pass = password.value;
  const mail = email.value;
  if (name === '') {
    loginError.textContent = 'Username required!';
  } else {
    createUserWithEmailAndPassword(auth, mail, pass)
      .then(userCredential => {
        // User created

        const userId = userCredential.user.uid;

        //Add user to database

        set(ref(database, 'users/' + userId), {
          coordinates: getLocation,
          username: name,
          email: mail,
        })
          .then(() => {
            console.log('Data saved successfully!');
            return addData(userId);
            //window.location.assign('mainPage.html');
          })
          .catch(error => {
            console.error('Error saving data:', error);
          });

        // ...
      })
      .catch(error => {
        const errorCode = error.code;

        console.log(errorCode);
        const errorMessage = error.message;
        loginError.style.opacity = 1;
        loginError.textContent = errorMessage;
        console.log(errorMessage);
        // ..
      });
  }
});

//! Sign-in user
login.addEventListener('click', function (e) {
  e.preventDefault();
  const pass = password.value;
  const mail = email.value;

  signInWithEmailAndPassword(auth, mail, pass)
    .then(userCredential => {
      // Signed in
      const userId = userCredential.user.uid;

      //console.log(userId);
      return addData(userId);
    })
    .catch(error => {
      const errorCode = error.code;

      console.log(errorCode);
      const errorMessage = error.message;
      loginError.style.opacity = 1;
      loginError.textContent = errorMessage;
      console.log(errorMessage);
      // ..
    });
});

//! Add data to user
const addData = function (userId) {
  update(ref(database, 'users/' + userId), {
    last_login: dateFormatted(),
    coordinates: getLocation,
  })
    .then(() => {
      console.log('Signed in');

      window.location.assign('mainPage.html');
      return userId;
    })
    .catch(error => {
      console.error('Error saving data:', error);
    });
};

//date
function dateFormatted() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  return (dateFormatted = `${day}/${month}/${year}, ${hour}:${minutes}`);
}
