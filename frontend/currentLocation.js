const messages = {
  1: 'Location permission was denied. Allow location access in your browser and try again.',
  2: 'Your location is unavailable. Try again or search for a city.',
  3: 'Finding your location timed out. Check that location services are enabled for your browser, then try again or search for a city.',
};

export const getCurrentLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Your browser does not support location access. Search for a city instead.'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ name: 'My location', latitude: coords.latitude, longitude: coords.longitude }),
    ({ code }) => reject(new Error(messages[code] ?? 'Could not find your location. Please try again.')),
    { enableHighAccuracy: false, timeout: 30000, maximumAge: 300000 },
  );
});
