import React from 'react';
import Icon from './Icon.jsx';
import { cityLabel } from '../cityLabel.js';
import { cityKey } from '../hooks/useFavorites.js';

const FavoriteLocations = ({ favorites, busy, onLoad, activeLocation }) => (
  <section className="panel mt-5" aria-labelledby="favorites-heading">
    <div className="favorites-heading"><h2 id="favorites-heading">Favorite locations</h2><span className="muted">{favorites.cities.length} saved</span></div>
    {favorites.error && <p role="alert" className="rounded-lg bg-[#fff0ed] p-3 text-[#982e24] leading-normal">{favorites.error}</p>}
    {favorites.cities.length ? (
      <ul className="favorite-cards">
        {favorites.cities.map((saved) => (
          <li key={cityKey(saved)} className="favorite-card">
            <button type="button" className="favorite-load" disabled={Boolean(busy)} onClick={() => onLoad(saved)} aria-pressed={Boolean(activeLocation && cityKey(activeLocation) === cityKey(saved))} aria-label={`Load weather for ${cityLabel(saved)}`}>
              <Icon name="pin" className="favorite-pin" />
              <span className="favorite-label"><strong>{saved.name}</strong><span>{[saved.admin1, saved.country].filter(Boolean).join(', ') || `${saved.latitude.toFixed(2)}°, ${saved.longitude.toFixed(2)}°`}</span></span>
              {activeLocation && cityKey(activeLocation) === cityKey(saved) && <span className="favorite-active">Active</span>}
            </button>
            <button type="button" className="favorite-remove" onClick={() => favorites.remove(saved)} aria-label={`Remove ${cityLabel(saved)} from favorites`}><Icon name="close" size={16} /></button>
          </li>
        ))}
      </ul>
    ) : <div className="favorites-empty"><Icon name="star" size={28} /><p className="muted">Save a city from search or a location from the globe for quick access.</p></div>}
  </section>
);

export default FavoriteLocations;
