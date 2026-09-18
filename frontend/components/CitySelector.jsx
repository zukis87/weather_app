import React from 'react';
import { cityLabel } from '../cityLabel.js';

const CitySelector = ({ cities, selected, busy, onSelect, onGetWeather }) => (
  cities.length > 0 ? (
    <div className="selection">
      <label htmlFor="city-match">Choose a matching location</label>
      <select
        id="city-match"
        value={selected}
        disabled={Boolean(busy)}
        onChange={(event) => onSelect(event.target.value)}
      >
        {cities.map((city, index) => (
          <option key={city.id ?? index} value={String(index)}>
            {cityLabel(city)}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="show-weather"
        onClick={onGetWeather}
        disabled={Boolean(busy)}
      >
        {busy === 'weather' ? 'Loading…' : 'Show weather →'}
      </button>
    </div>
  ) : null
);

export default CitySelector;
