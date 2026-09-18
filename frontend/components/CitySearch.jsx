import React from 'react';

const CitySearch = ({ query, busy, onQueryChange, onSearch }) => (
  <form onSubmit={onSearch}>
    <label htmlFor="city-search">Find a city</label>
    <div className="search-row">
      <input
        id="city-search"
        value={query}
        placeholder="e.g. Tel Aviv or London"
        required
        minLength={2}
        disabled={Boolean(busy)}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <button
        type="submit"
        disabled={Boolean(busy) || query.trim().length < 2}
      >
        {busy === 'search' ? 'Searching…' : 'Search'}
      </button>
    </div>
  </form>
);

export default CitySearch;
