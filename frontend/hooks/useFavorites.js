import { useState } from 'react';

export const FAVORITES_KEY = 'weather.favorites.v1';
export const cityKey = (city) => `${city.latitude},${city.longitude}`;
const validCity = (city) => city && typeof city.name === 'string' && city.name.trim()
  && Number.isFinite(city.latitude) && Math.abs(city.latitude) <= 90
  && Number.isFinite(city.longitude) && Math.abs(city.longitude) <= 180;

const readFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]');
    return {
      cities: Array.isArray(saved) ? saved.filter(validCity).filter((city, index, cities) => cities.findIndex((other) => cityKey(other) === cityKey(city)) === index) : [],
      error: '',
    };
  } catch {
    return { cities: [], error: 'Saved favorites could not be loaded.' };
  }
};

const useFavorites = () => {
  const [state, setState] = useState(readFavorites);
  const update = (cities) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(cities));
      setState({ cities, error: '' });
    } catch {
      setState({ cities, error: 'Favorites are available for this visit, but could not be saved in your browser.' });
    }
  };
  const contains = (city) => state.cities.some((saved) => cityKey(saved) === cityKey(city));
  const add = (city) => {
    if (validCity(city) && !contains(city)) update([...state.cities, city]);
  };
  const remove = (city) => update(state.cities.filter((saved) => cityKey(saved) !== cityKey(city)));

  return { cities: state.cities, error: state.error, contains, add, remove };
};

export default useFavorites;
