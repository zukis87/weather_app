import React from 'react';
import CitySearch from './CitySearch.jsx';
import CitySelector from './CitySelector.jsx';

const CitySearchPanel = ({ weather, favorites }) => (
  <section className="panel" aria-label="Choose a city" aria-busy={Boolean(weather.busy)}>
    <CitySearch
      query={weather.query}
      busy={weather.busy}
      onQueryChange={weather.setQuery}
      onSearch={weather.search}
    />
    <CitySelector
      cities={weather.cities}
      selected={weather.selected}
      busy={weather.busy}
      onSelect={weather.selectCity}
      onGetWeather={weather.fetchWeather}
    />
    {weather.selectedCity && (
      <button
        className="save-location"
        type="button"
        disabled={favorites.contains(weather.selectedCity)}
        onClick={() => favorites.add(weather.selectedCity)}
      >
        {favorites.contains(weather.selectedCity) ? '★ Saved' : '☆ Save city'}
      </button>
    )}
  </section>
);

export default CitySearchPanel;
