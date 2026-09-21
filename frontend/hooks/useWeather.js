import { useState } from 'react';
import { getWeather, searchCities } from '../api.js';
import { getCurrentLocation } from '../currentLocation.js';

const errorMessage = (error) => {
  if (error.name === 'TimeoutError') {
    return 'The request timed out. Please try again.';
  }
  if (error instanceof TypeError) {
    return 'Could not connect. Check your connection and try again.';
  }
  return error.message;
};

const useWeather = () => {
  const [query, setQuery] = useState('Tel Aviv');
  const [cities, setCities] = useState([]);
  const [selected, setSelected] = useState('0');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState('');
  const [status, setStatus] = useState('Search for a city to get started.');
  const [error, setError] = useState('');

  const run = async (task, operation) => {
    setBusy(task);
    setError('');
    setResult(null);
    setStatus(task === 'location' ? 'Finding your location…' : task === 'search' ? 'Searching for cities…' : 'Loading weather and weekly forecast…');
    try {
      await operation();
    } catch (error) {
      setStatus('');
      setError(errorMessage(error));
    } finally {
      setBusy('');
    }
  };

  const search = (event) => {
    event.preventDefault();
    if (busy) return;
    setCities([]);
    run('search', async () => {
      const matches = await searchCities(query.trim());
      setCities(matches);
      setSelected('0');
      setStatus(matches.length ? 'Choose your city below.' : 'No cities found. Try another name.');
    });
  };

  const loadWeather = (city) => {
    if (busy || !city) return;
    run('weather', async () => {
      const weather = await getWeather(city);
      setResult({ city, weather });
      setStatus('Weather updated.');
    });
  };

  const locate = () => {
    if (busy) return;
    run('location', async () => {
      const city = await getCurrentLocation();
      setBusy('weather');
      setStatus('Loading weather and weekly forecast…');
      const weather = await getWeather(city);
      setResult({ city, weather });
      setStatus('Weather updated for your location.');
    });
  };

  const fetchWeather = () => loadWeather(cities[Number(selected)]);
  const selectCity = (value) => {
    setSelected(value);
    setResult(null);
    setError('');
    setStatus('Click Show weather to continue.');
  };

  return {
    query, cities, selected, result, busy, status, error,
    selectedCity: cities[Number(selected)],
    setQuery, search, loadWeather, fetchWeather, selectCity, locate,
  };
};

export default useWeather;
