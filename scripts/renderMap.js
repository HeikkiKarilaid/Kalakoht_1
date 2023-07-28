import L from 'leaflet';
import { getDatabase, ref, update, push, child, get } from 'firebase/database';
import { app } from './firebaseConfig.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebaseConfig.js';
import { getLocation } from './getLocation.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
const storage = getStorage(app);
const filePath = 'images/' + Date.now();
const imgRef = storageRef(storage, filePath);
const capture = document.querySelector('.capture');
const modal = document.querySelector('.modal');
const comment = document.querySelector('.comment');
const commentBox = document.querySelector('.comment-box');

const picBox = document.querySelector('.pic-box');
const closeModal = document.querySelector('.closeModal');
const centerMap = document.querySelector('.map-button');
const upload = document.querySelector('.upload');
const modalCam = document.querySelector('.modal-cam');
const player = document.querySelector('.player');
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const camera = document.querySelector('.camera');

const constraints = {
  video: {
    width: { ideal: 1920 }, // Replace with the desired width
    height: { ideal: 1080 }, // Replace with the desired height
    facingMode: 'environment',
  },
};

const database = getDatabase(app);
const auth = getAuth();
let downloadUrl = '';
let imageDataURL = '';
let map;
let capturedImage = null;
let mediaStream; // Store the media stream to access it later for stopping
//! Map on click
export const renderMap = function (coords, name) {
  map = L.map('map-container').setView(coords, 8);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // L.marker(coords).addTo(map).bindPopup(`Current location `).openPopup();

  map.on('click', function (mapEvent) {
    const { lat, lng } = mapEvent.latlng;

    modal.classList.remove('hidden'); // Show the modal
    camera.addEventListener('click', startCamera);

    //! Function to add the clicked coordinates, pic_url and user comments to the database
    function addLocationToDatabase(comment) {
      console.log(downloadUrl);
      const userId = auth.currentUser.uid;
      const addedLocationsRef = ref(
        database,
        'users/' + userId + '/addedLocations'
      );
      const newLocationKey = push(addedLocationsRef).key;
      const newLocationRef = child(addedLocationsRef, newLocationKey);

      // Use the Firebase Realtime Database's update() method to add the new coordinates and comment
      update(newLocationRef, { lat, lng, comment, downloadUrl })
        .then(() => {
          console.log('Coordinates, pic and comment added successfully!');
        })
        .catch(error => {
          console.error('Error adding coordinates and comment:', error);
        });
    }
    const closeModalHandler = function () {
      modal.classList.add('hidden'); // Close the modal when the close button is clicked
      const userComment = comment.value;
      console.log(userComment);
      comment.value = '';
      addLocationToDatabase(userComment); // Call the function to add coordinates and user comment
      renderPopup([lat, lng], name, userComment, downloadUrl);
      closeModal.removeEventListener('click', closeModalHandler); // Remove the event listener
      comment.removeEventListener('keyup', commentKeyUpHandler);
    };

    closeModal.addEventListener('click', closeModalHandler); //! Close the modal when the close button is clicked and add data to database
    // closeModal.addEventListener('click', function () {
    //   modal.classList.add('hidden'); // Close the modal when the close button is clicked
    //   const userComment = comment.value;
    //   console.log(userComment);
    //   comment.value = '';
    //   addLocationToDatabase(userComment); // Call the function to add coordinates and user comment
    // });
    const commentKeyUpHandler = function (event) {
      if (event.key === 'Enter') {
        modal.classList.add('hidden'); // Close the modal when Enter is pressed
        const userComment = comment.value;
        console.log(userComment);
        comment.value = '';
        addLocationToDatabase(userComment); // Call the function to add coordinates and user comment
        comment.removeEventListener('keyup', commentKeyUpHandler);
        closeModal.removeEventListener('click', closeModalHandler); // Remove the event listener
        renderPopup([lat, lng], name, userComment, downloadUrl);
      }
    };

    comment.addEventListener('keyup', commentKeyUpHandler); //! Close the modal when Enter is pressed and add data to database
    // comment.addEventListener('keyup', function (event) {
    //   if (event.key === 'Enter') {
    //     modal.classList.add('hidden'); // Close the modal when Enter is pressed
    //     const userComment = comment.value;
    //     console.log(userComment);
    //     comment.value = '';
    //     addLocationToDatabase(userComment); // Call the function to add coordinates and user comment
    //   }
    // });

    //renderPopup([lat, lng], name);
  });
  centerMap.addEventListener('click', function () {
    map.setView([getLocation.latitude, getLocation.longitude], 15);
  });
};

//! Get all locations and associated info from database

const usersRef = ref(database, 'users');

get(usersRef)
  .then(snapshot => {
    if (snapshot.exists() && snapshot.val() !== null) {
      const users = snapshot.val();

      Object.entries(users).forEach(([userId, user]) => {
        const addedLocations = user.addedLocations;
        console.log(user.username);
        //const locationComments = {};
        if (addedLocations && Object.keys(addedLocations).length > 0) {
          Object.entries(addedLocations).forEach(([locationId, location]) => {
            const latitude = location.lat;
            const longitude = location.lng;
            console.log(locationId);
            const userComment = location.comment;
            const locPic = location.downloadUrl;
            //locationComments[locationId] = userComment;
            //console.log(locationComments);
            setTimeout(() => {
              renderPopup(
                [latitude, longitude],
                user.username,
                userComment,
                locPic
              ); // Call renderPopup function inside the setTimeout
            }, 1500);

            // Do something with the latitude and longitude
            //console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
          });
        }
      });
    } else {
      console.log('No data available');
    }
  })
  .catch(error => {
    console.error(error);
  });

const renderPopup = function ([lat, lng], name, userComment, locPic) {
  if (userComment === undefined) {
    userComment = '';
  }

  const marker = L.marker([lat, lng], { userComment: userComment })
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: true,
        closeOnClick: true,
        className: 'pop-up',
      })
    )
    .setPopupContent(`Location added by ${name} `)
    .openPopup();

  marker.on('click', function () {
    const clickedMarker = this;
    const clickedMarkerUserComment = clickedMarker.options.userComment;
    console.log(clickedMarkerUserComment);
    commentBox.innerHTML = clickedMarkerUserComment;

    while (picBox.firstChild) {
      picBox.removeChild(picBox.firstChild);
    }
    const imageElement = document.createElement('img');

    // Set the 'src' attribute of the img element to the image URL
    imageElement.src = locPic;

    // Set the 'alt' attribute for better accessibility
    imageElement.alt = 'Image';

    // Append the img element to the container
    picBox.appendChild(imageElement);
  });
};

//! Camera action
//Start camera
function startCamera() {
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    mediaStream = stream;
    player.srcObject = stream;
    console.log('camera started');
    modal.classList.add('hidden');
    modalCam.classList.remove('hidden');
    upload.classList.remove('hidden');
  });
}
capture.addEventListener('click', captureImage);
//Capture image
function captureImage() {
  // Set the canvas dimensions after the video's metadata is loaded
  canvas.width = player.videoWidth;
  canvas.height = player.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(player, 0, 0, canvas.width, canvas.height);

  // Get the data URL of the captured image
  imageDataURL = canvas.toDataURL('image/jpeg', 1);

  // Do something with the imageDataURL, such as displaying it on the page or sending it to a server.
  //console.log(imageDataURL);
  //console.log(mediaStream);

  upload.classList.remove('hidden');
}
// Stop the media stream track to close the video stream
upload.addEventListener('click', stopMediaStream);

//Stop Camera
function stopMediaStream() {
  if (mediaStream) {
    const tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop());
    player.pause();
    player.srcObject = null; // Release the video element from the stream
    mediaStream = null; // Reset the mediaStream variable
    modalCam.classList.add('hidden'); //hide cam-modal
    modal.classList.remove('hidden'); //reveal modal
    upload.classList.add('hidden'); // hide upload button
    //convert imgUrl to blob
    const base64String = imageDataURL.split(',')[1];
    const byteCharacters = atob(base64String);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: 'image/png' });

    downloadUrl = uploadBytes(imgRef, blob)
      .then(snapshot => {
        console.log(snapshot);
        console.log('Uploaded the image successfully!');
      })
      .then(() => {
        getDownloadURL(imgRef).then(dlUrl => {
          console.log('File available at', dlUrl);
          downloadUrl = dlUrl;
        });
      })

      .catch(error => {
        console.error('Error uploading the image:', error);
      });
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}
