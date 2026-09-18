import React, { useState } from 'react';
import LocationTabs from './LocationTabs.jsx';
import CitySearchPanel from './CitySearchPanel.jsx';
import FavoriteLocations from './FavoriteLocations.jsx';
import GlobePicker from './GlobePicker.jsx';

const LocationPicker = ({ weather, favorites }) => {
  const [activeTab, setActiveTab] = useState(() => favorites.cities.length ? 'favorites' : 'search');

  return (
    <>
      <LocationTabs active={activeTab} onChange={setActiveTab} />
      <div role="tabpanel" id={`location-panel-${activeTab}`} aria-labelledby={`location-tab-${activeTab}`}>
        {activeTab === 'search' && <CitySearchPanel weather={weather} favorites={favorites} />}
        {activeTab === 'globe' && <GlobePicker busy={weather.busy} onLoad={weather.loadWeather} favorites={favorites} />}
        {activeTab === 'favorites' && (
          <FavoriteLocations
            favorites={{ ...favorites, error: '' }}
            busy={weather.busy}
            onLoad={weather.loadWeather}
          />
        )}
      </div>
    </>
  );
};

export default LocationPicker;
