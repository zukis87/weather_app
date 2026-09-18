import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import App from '../app.jsx';
import { FAVORITES_KEY } from '../hooks/useFavorites.js';

beforeEach(() => localStorage.clear());
it('defaults to search with no favorites and supports keyboard switching to globe', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const user = userEvent.setup();
  render(<App />);
  const search = screen.getByRole('tab', { name: 'Find a city' });
  expect(search).toHaveAttribute('aria-selected', 'true');
  search.focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Favorites' })).toHaveFocus();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('region', { name: 'Explore the globe' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Explore globe' })).not.toBeInTheDocument();
});
it('defaults to favorites when saved cities exist', () => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([{ name: 'London', latitude: 51, longitude: 0 }]));
  render(<App />);
  expect(screen.getByRole('tab', { name: 'Favorites' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: 'Load weather for London' })).toBeVisible();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
