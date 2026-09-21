import Icon from './Icon.jsx';
import React, { useState } from 'react';

const SaveLocation = ({ location, favorites }) => {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const saved = favorites.contains(location);
  const save = (event) => {
    event.preventDefault();
    if (!name.trim() || saved) return;
    favorites.add({ ...location, name: name.trim() });
  };

  return saved ? (
    <button className="mt-4 inline-flex items-center gap-2" type="button" disabled><Icon name="star" size={18} /> Saved</button>
  ) : !editing ? (
    <button className="mt-4 inline-flex items-center gap-2" type="button" onClick={() => setEditing(true)}><Icon name="star" size={18} /> Save location</button>
  ) : (
    <form className="mt-5" onSubmit={save}>
      <label htmlFor="location-name">Location name</label>
      <div className="flex gap-2.5 max-[481px]:flex-col">
        <input autoFocus id="location-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. My favorite beach" required maxLength={80} disabled={saved} />
        <button type="submit" disabled={saved || !name.trim()}>Save to favorites</button>
      </div>
    </form>
  );
};

export default SaveLocation;
