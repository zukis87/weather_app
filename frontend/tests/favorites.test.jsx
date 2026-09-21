import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from '../app.jsx';
import { FAVORITES_KEY } from '../hooks/useFavorites.js';
import { searchCities, getWeather } from '../api.js';

vi.mock('../api.js', () => ({ searchCities: vi.fn(), getWeather: vi.fn() }));
const city = { name: 'London', latitude: 51, longitude: 0 };
const weather = { temperature: 10, humidity: 60, time: '2026-09-17 12:00', forecast: [], hourly: [] };
beforeEach(() => localStorage.clear());

it('saves without duplicates, reloads, loads weather directly and removes persistently', async () => {
  const user = userEvent.setup();
  searchCities.mockResolvedValue([city]);
  getWeather.mockResolvedValue(weather);
  const view = render(<App />);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await user.click(await screen.findByRole('button', { name: 'Save city' }));
  expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
  expect(JSON.parse(localStorage.getItem(FAVORITES_KEY))).toEqual([city]);
  view.unmount();
  render(<App />);
  searchCities.mockClear();
  expect(screen.getByRole('button', { name: 'Load weather for London' })).toHaveAttribute('aria-pressed', 'false');
  await user.click(screen.getByRole('button', { name: 'Load weather for London' }));
  await screen.findByRole('region', { name: 'Current weather' });
  expect(getWeather).toHaveBeenCalledWith(city);
  expect(screen.getByRole('button', { name: 'Load weather for London' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Active')).toBeVisible();
  expect(searchCities).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Remove London from favorites' }));
  expect(screen.queryByRole('button', { name: 'Load weather for London' })).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(FAVORITES_KEY))).toEqual([]);
});

it('recovers from corrupt storage without crashing', () => {
  localStorage.setItem(FAVORITES_KEY, 'broken');
  render(<App />);
  expect(screen.getByRole('alert')).toHaveTextContent('could not be loaded');
  expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
});

it('ignores invalid entries and deduplicates saved coordinates', () => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([city, city, null, { name: 'Invalid', latitude: 100, longitude: 0 }]));
  render(<App />);
  expect(screen.getAllByRole('button', { name: 'Load weather for London' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: /Load weather for Invalid/ })).not.toBeInTheDocument();
});

it('reports storage failure and keeps favorites usable for this visit', async () => {
  const user = userEvent.setup();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full'); });
  searchCities.mockResolvedValue([city]);
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await user.click(await screen.findByRole('button', { name: 'Save city' }));
  expect(screen.getByRole('alert')).toHaveTextContent('could not be saved');
  await user.click(screen.getByRole('tab', { name: 'Favorites' }));
  expect(screen.getByRole('button', { name: 'Load weather for London' })).toBeEnabled();
});

it('lists cities and coordinates together without a save-city button', () => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([city, { name: '0.000°, -30.000°', latitude: 0, longitude: -30 }]));
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Favorite locations' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Load weather for London' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Load weather for 0.000°, -30.000°' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Save city' })).not.toBeInTheDocument();
});
