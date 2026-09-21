import React from 'react';
import TabIcon from './TabIcon.jsx';

const tabs = [
  { id: 'search', label: 'Find a city', icon: 'search' },
  { id: 'favorites', label: 'Favorites', icon: 'star' },
  { id: 'globe', label: 'Globe', icon: 'globe' },
  { id: 'location', label: 'My location', icon: 'location' },
];

const LocationTabs = ({ active, onChange }) => {
  const navigate = (event, index) => {
    const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(tabs[next].id);
    event.currentTarget.parentElement.children[next].focus();
  };
  return (
    <div className="location-tabs" role="tablist" aria-label="Choose a location">
      {tabs.map(({ id, label, icon }, index) => <button key={id} type="button" role="tab" aria-label={label} id={`location-tab-${id}`} aria-controls={`location-panel-${id}`} aria-selected={active === id} tabIndex={active === id ? 0 : -1} onClick={() => onChange(id)} onKeyDown={(event) => navigate(event, index)}><span className="tab-tooltip" aria-hidden="true">{label}</span><TabIcon name={icon} /></button>)}
    </div>
  );
};

export default LocationTabs;
