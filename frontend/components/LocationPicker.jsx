import React, { useState } from 'react';
import LocationTabs from './LocationTabs.jsx';
import CitySearchPanel from './CitySearchPanel.jsx';
import FavoriteLocations from './FavoriteLocations.jsx';
import GlobePicker from './GlobePicker.jsx';

const LocationPicker = ({ weather, favorites }) => {
  const [activeTab, setActiveTab] = useState(() => favorites.cities.length ? 'favorites' : 'search');

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'location') weather.locate();
  };

  return (
    <>
      <LocationTabs active={activeTab} onChange={selectTab} />
      <div key={activeTab} className="location-panel" role="tabpanel" id={`location-panel-${activeTab}`} aria-labelledby={`location-tab-${activeTab}`}>
        {activeTab === 'location' && (
          <section className="panel current-location-panel" aria-busy={Boolean(weather.busy)}>
            <h2>My location</h2>
            <p className="muted">{weather.busy === 'location' ? 'Finding your location… This can take up to 30 seconds.' : 'Use your browser’s location to see your local forecast.'}</p>
            <button type="button" className="mt-4" onClick={weather.locate} disabled={Boolean(weather.busy)}>
              {weather.busy ? 'Please wait…' : weather.error ? 'Try my location again' : 'Refresh my location'}
            </button>
          </section>
        )}
        {activeTab === 'search' && <CitySearchPanel weather={weather} favorites={favorites} />}
        {activeTab === 'globe' && <GlobePicker busy={weather.busy} onLoad={weather.loadWeather} favorites={favorites} />}
        {activeTab === 'favorites' && (
          <FavoriteLocations
            favorites={{ ...favorites, error: '' }}
            activeLocation={weather.result?.city}
            busy={weather.busy}
            onLoad={weather.loadWeather}
          />
        )}
      </div>
    </>
  );
};

export default LocationPicker;
