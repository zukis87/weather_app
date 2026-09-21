import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import App from '../app.jsx';
import HourlyChart from '../components/HourlyChart.jsx';
import { getWeather, searchCities } from '../api.js';
import { getWeatherAppearance } from '../weatherAppearance.js';

vi.mock('../api.js', () => ({ getWeather: vi.fn(), searchCities: vi.fn() }));
const cities = [{ id: 1, name: 'London', latitude: 51, longitude: 0 }, { id: 2, name: 'Paris', latitude: 48, longitude: 2 }];
const weather = { temperature: 0, humidity: 0, time: '2026-09-17 12:00', weather_code: 61, is_day: 1, forecast: [], hourly: [], wind_speed: 0, apparent_temperature: -2 };

it('searches, selects a city, loads weather and clears stale results on city change', async () => {
  const user = userEvent.setup();
  searchCities.mockResolvedValue(cities);
  getWeather.mockResolvedValue(weather);
  render(<App />);
  await user.clear(screen.getByRole('textbox', { name: 'Find a city' }));
  await user.type(screen.getByRole('textbox'), 'London');
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await screen.findByRole('combobox');
  expect(searchCities).toHaveBeenCalledWith('London');
  await user.click(screen.getByRole('button', { name: /Show weather/ }));
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('Rain');
  expect(getWeather).toHaveBeenCalledWith(cities[0]);
  expect(screen.getByText('0.0 km/h')).toBeInTheDocument();
  await user.selectOptions(screen.getByRole('combobox'), '1');
  expect(screen.queryByRole('region', { name: 'Current weather' })).not.toBeInTheDocument();
});

it('disables duplicate searches while pending and allows retry after failure', async () => {
  const user = userEvent.setup();
  let rejectSearch;
  searchCities.mockReturnValueOnce(new Promise((resolve, reject) => { rejectSearch = reject; }));
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  expect(screen.getByRole('button', { name: 'Searching…' })).toBeDisabled();
  expect(screen.getByRole('region', { name: 'Loading locations' })).toHaveAttribute('aria-busy', 'true');
  rejectSearch(new Error('Service unavailable'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Service unavailable');
  expect(screen.queryByRole('region', { name: 'Loading locations' })).not.toBeInTheDocument();
  searchCities.mockResolvedValueOnce([]);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No cities found'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('explores hourly values and preserves missing readings', () => {
  render(<HourlyChart hours={[{ time: '2026-09-17T00:00', temperature: 0 }, { time: '2026-09-17T01:00', temperature: null }]} field="temperature" label="Temperature" unit="°C" />);
  const slider = screen.getByRole('slider', { name: 'Temperature: select hour' });
  expect(slider).toHaveAttribute('aria-valuetext', '00:00, 0°C');
  fireEvent.change(slider, { target: { value: '1' } });
  expect(slider).toHaveAttribute('aria-valuetext', '01:00, Unavailable');
  expect(screen.getByText('Unavailable')).toBeInTheDocument();
});

it.each([[0, 1, 'sunny'], [0, 0, 'night'], [3, 1, 'cloudy'], [61, 0, 'rainy'], [71, 1, 'snowy'], [95, 1, 'stormy'], [null, 1, 'unknown']])('maps weather %s at day flag %s to %s', (code, isDay, theme) => expect(getWeatherAppearance(code, isDay).theme).toBe(theme));

it('replaces the weather skeleton with actual readings when the request completes', async () => {
  const user = userEvent.setup();
  let resolveWeather;
  searchCities.mockResolvedValue(cities);
  getWeather.mockReturnValueOnce(new Promise((resolve) => { resolveWeather = resolve; }));
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  await user.click(await screen.findByRole('button', { name: /Show weather/ }));
  expect(screen.getByRole('region', { name: 'Loading weather' })).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByRole('region', { name: 'Current weather' })).not.toBeInTheDocument();
  resolveWeather(weather);
  expect(await screen.findByRole('region', { name: 'Current weather' })).toHaveTextContent('0.0');
  expect(screen.queryByRole('region', { name: 'Loading weather' })).not.toBeInTheDocument();
});
