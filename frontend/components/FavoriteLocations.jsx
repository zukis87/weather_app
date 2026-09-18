import React from 'react';
import { cityLabel } from '../cityLabel.js';
import { cityKey } from '../hooks/useFavorites.js';

const FavoriteLocations = ({ favorites, busy, onLoad }) => (
  <section className="panel favorites" aria-labelledby="favorites-heading">
    <div className="favorites-heading">
      <h2 id="favorites-heading">Favorite locations</h2>
    </div>
    {favorites.error && <p role="alert" className="error">{favorites.error}</p>}
    {favorites.cities.length ? (
      <ul className="favorites-list">
        {favorites.cities.map((saved) => (
          <li key={cityKey(saved)}>
            <button type="button" disabled={Boolean(busy)} onClick={() => onLoad(saved)} aria-label={`Load weather for ${cityLabel(saved)}`}>{cityLabel(saved)}</button>
            <button type="button" className="favorite-remove" onClick={() => favorites.remove(saved)} aria-label={`Remove ${cityLabel(saved)} from favorites`}>Remove</button>
          </li>
        ))}
      </ul>
    ) : <p className="muted">Save a city from search or a location from the globe for quick access.</p>}
  </section>
);

export default FavoriteLocations;
