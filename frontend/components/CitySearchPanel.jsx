import Icon from './Icon.jsx';
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
        className="mt-4 inline-flex items-center gap-2"
        type="button"
        disabled={favorites.contains(weather.selectedCity)}
        onClick={() => favorites.add(weather.selectedCity)}
      >
        <Icon name="star" size={18} /> {favorites.contains(weather.selectedCity) ? 'Saved' : 'Save city'}
      </button>
    )}
  </section>
);

export default CitySearchPanel;
