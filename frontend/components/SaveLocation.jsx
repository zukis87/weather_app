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
    <button className="save-location" type="button" disabled>★ Saved</button>
  ) : !editing ? (
    <button className="save-location" type="button" onClick={() => setEditing(true)}>☆ Save location</button>
  ) : (
    <form className="save-location-form" onSubmit={save}>
      <label htmlFor="location-name">Location name</label>
      <div className="search-row">
        <input autoFocus id="location-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. My favorite beach" required maxLength={80} disabled={saved} />
        <button type="submit" disabled={saved || !name.trim()}>Save to favorites</button>
      </div>
    </form>
  );
};

export default SaveLocation;
