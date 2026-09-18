import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const GlobeCanvas = ({ location, onSelect, disabled }) => {
  const container = useRef(null);
  const globe = useRef(null);
  const gesture = useRef(null);
  const [width, setWidth] = useState(500);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const ready = () => {
    globe.current.pointOfView({ lat: 25, lng: 20, altitude: 2.2 });
    globe.current.controls().enablePan = false;
    globe.current.controls().minDistance = 120;
    globe.current.controls().maxDistance = 500;
  };
  const track = (event) => {
    if (gesture.current && Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y) > 6) gesture.current.dragged = true;
  };

  return (
    <div ref={container} className="globe-canvas" onPointerDownCapture={(event) => { gesture.current = { x: event.clientX, y: event.clientY, dragged: false }; }} onPointerMoveCapture={track}>
      <Globe ref={globe} width={width} height={Math.min(width, 440)}
        globeImageUrl="/earth-blue-marble.jpg" backgroundColor="#101f2d"
        atmosphereColor="#a3cddd" atmosphereAltitude={0.15} onGlobeReady={ready}
        onGlobeClick={({ lat, lng }) => { if (!disabled && !gesture.current?.dragged) onSelect({ lat, lng }); }}
        pointsData={location ? [location] : []} pointLat="latitude" pointLng="longitude"
        pointColor={() => '#ffcc66'} pointAltitude={0.04} pointRadius={0.6} pointLabel={() => ''}
      />
    </div>
  );
};

export default GlobeCanvas;
