import React from 'react';
import WeatherSkeleton from './components/WeatherSkeleton.jsx';
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
    <main className="mx-auto max-w-[1200px] px-6 pt-15 pb-[30px] max-[481px]:px-4 max-[481px]:py-7">
      <AppHeader />
      <div className="location-workspace"><LocationPicker weather={weather} favorites={favorites} /></div>
      <p className="mt-4 mb-0 text-[13px] text-[#65756b]" role="status">{weather.status}</p>
      {weather.error && <p className="rounded-lg bg-[#fff0ed] p-3 text-[#982e24] leading-normal" role="alert">{weather.error}</p>}
      {favorites.error && <p className="rounded-lg bg-[#fff0ed] p-3 text-[#982e24] leading-normal" role="alert">{favorites.error}</p>}
      {weather.busy ? <WeatherSkeleton search={weather.busy === 'search'} /> : weather.result ? (
        <div className="weather-layout">
          <WeatherResult {...weather.result} />
          <div className="forecast-column"><ForecastExplorer weather={weather.result.weather} /></div>
        </div>
      ) : <EmptyState />}
      <AppFooter />
    </main>
  );
};

export default App;
