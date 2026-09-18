import React from 'react';
import useFavorites from './hooks/useFavorites.js';
import useWeather from './hooks/useWeather.js';
import LocationPicker from './components/LocationPicker.jsx';
import WeatherResult from './components/WeatherResult.jsx';
import ForecastExplorer from './components/ForecastExplorer.jsx';
import { AppHeader, AppFooter, EmptyState } from './components/Layout.jsx';

const App = () => {
  const favorites = useFavorites();
  const weather = useWeather();

  return (
    <main className="app">
      <AppHeader />
      <LocationPicker weather={weather} favorites={favorites} />
      <p className="status" role="status">{weather.status}</p>
      {weather.error && <p className="error" role="alert">{weather.error}</p>}
      {favorites.error && <p className="error" role="alert">{favorites.error}</p>}
      {weather.result ? (
        <>
          <WeatherResult {...weather.result} />
          <ForecastExplorer weather={weather.result.weather} />
        </>
      ) : <EmptyState />}
      <AppFooter />
    </main>
  );
};

export default App;
