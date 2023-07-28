function geolocation() {
  let result = { latitude: null, longitude: null };
  navigator.geolocation.getCurrentPosition(
    function (position) {
      result.latitude = position.coords.latitude;
      result.longitude = position.coords.longitude;
      console.log(result);
    },
    function () {
      alert('Could not get location');
    }
  );

  return result;
}

export const getLocation = geolocation();
