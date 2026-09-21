import React, { lazy, Suspense, useState } from 'react';

import SaveLocation from './SaveLocation.jsx';

const GlobeCanvas = lazy(() => import('./GlobeCanvas.jsx'));
const supportsGlobe = () => {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
};
export const coordinateLocation = ({ lat, lng }) => ({
  name: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
  latitude: Number(lat.toFixed(3)), longitude: Number(lng.toFixed(3)),
});

const GlobePicker = ({ busy, onLoad, favorites }) => {
  const [supported] = useState(supportsGlobe);
  const [location, setLocation] = useState(null);

  return (
    <section className="panel mt-5" aria-label="Explore the globe">
      <div>
        <p className="muted">Drag to rotate. Scroll or pinch to zoom. Tap a location, then show its weather. City search is available in the Find a city tab.</p>
        {supported ? <Suspense fallback={<p role="status">Loading globe…</p>}><GlobeCanvas location={location} disabled={Boolean(busy)} onSelect={(coordinates) => setLocation(coordinateLocation(coordinates))} /></Suspense> : <p role="status">The 3D globe is unavailable in this browser. Use the Find a city tab.</p>}
        <div className="globe-preview mt-4 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite">{location ? `Selected: ${location.name}` : 'Select a location on Earth.'}</p>
          <button type="button" disabled={!location || Boolean(busy)} onClick={() => onLoad(location)}>{busy === 'weather' ? 'Loading…' : 'Show weather here'}</button>

        </div>
        {location && favorites && <SaveLocation key={`${location.latitude},${location.longitude}`} location={location} favorites={favorites} />}
        <p className="muted">Locations use coordinates, including ocean locations. Select a pin, give it a name, and save it with Save location.</p>
      </div>
    </section>
  );
};

export default GlobePicker;
