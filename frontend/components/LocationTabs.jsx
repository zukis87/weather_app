import React from 'react';

const tabs = [
  { id: 'search', label: 'Find a city', icon: '🔍' },
  { id: 'favorites', label: 'Favorites', icon: '★' },
  { id: 'globe', label: 'Globe', icon: '🌐' },
];

const LocationTabs = ({ active, onChange }) => {
  const navigate = (event, index) => {
    const next = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(tabs[next].id);
    event.currentTarget.parentElement.children[next].focus();
  };
  return (
    <div className="location-tabs" role="tablist" aria-label="Choose a location">
      {tabs.map(({ id, label, icon }, index) => <button key={id} type="button" role="tab" aria-label={label} id={`location-tab-${id}`} aria-controls={`location-panel-${id}`} aria-selected={active === id} tabIndex={active === id ? 0 : -1} onClick={() => onChange(id)} onKeyDown={(event) => navigate(event, index)}><span className="tab-tooltip" aria-hidden="true">{label}</span><span className="tab-icon" aria-hidden="true">{icon}</span></button>)}
    </div>
  );
};

export default LocationTabs;
