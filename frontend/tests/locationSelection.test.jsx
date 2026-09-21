import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from '../app.jsx';
import { getWeather, searchCities } from '../api.js';
import { FAVORITES_KEY } from '../hooks/useFavorites.js';

vi.mock('../api.js', () => ({ getWeather: vi.fn(), searchCities: vi.fn() }));
vi.mock('../components/GlobePicker.jsx', () => ({ default: ({ onLoad, favorites }) => <><button onClick={() => onLoad({ name: '0.000°, -30.000°', latitude: 0, longitude: -30 })}>Load globe point</button><button onClick={() => favorites.add({ name: '0.000°, -30.000°', latitude: 0, longitude: -30 })}>Save location</button></> }));
beforeEach(() => localStorage.clear());

it('keeps accessible tab names with anchored tooltip labels instead of native tooltips', () => {
  render(<App />);
  for (const name of ['Find a city', 'Favorites', 'Globe']) {
    const tab = screen.getByRole('tab', { name });
    expect(tab).not.toHaveAttribute('title');
    expect(tab).toHaveTextContent(name);
    expect(within(tab).getByText(name)).toHaveAttribute('aria-hidden', 'true');
  }
});

it('keeps city search intact after loading and saving a globe point and reloading its favorite', async () => {
  const user = userEvent.setup();
  searchCities.mockResolvedValue([{ name: 'London', latitude: 51, longitude: 0 }]);
  getWeather.mockResolvedValue({ temperature: 12, humidity: 50, time: '2026-09-17 12:00', forecast: [], hourly: [] });
  render(<App />);
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'London');
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await screen.findByRole('combobox');
  await user.click(screen.getByRole('tab', { name: 'Globe' }));
  await user.click(screen.getByRole('button', { name: 'Load globe point' }));
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('0.000°, -30.000°');
  await user.click(screen.getByRole('button', { name: 'Save location' }));
  expect(JSON.parse(localStorage.getItem(FAVORITES_KEY))[0].longitude).toBe(-30);
  await user.click(screen.getByRole('tab', { name: 'Favorites' }));
  await user.click(screen.getByRole('button', { name: 'Load weather for 0.000°, -30.000°' }));
  await screen.findByRole('region', { name: 'Current weather' });
  await user.click(screen.getByRole('tab', { name: 'Find a city' }));
  expect(screen.getByRole('textbox')).toHaveValue('London');
  expect(screen.getByRole('combobox')).toHaveDisplayValue('London');
  await user.click(screen.getByRole('button', { name: /Show weather/ }));
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('London');
  expect(getWeather).toHaveBeenLastCalledWith({ name: 'London', latitude: 51, longitude: 0 });
});
