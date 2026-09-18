import { expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../api.js';

it('encodes city queries and returns server data', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ name: 'London' }] });
  vi.stubGlobal('fetch', fetch);
  expect(await searchCities('Tel Aviv & coast')).toEqual([{ name: 'London' }]);
  expect(new URL(fetch.mock.calls[0][0], 'http://localhost').searchParams.get('name')).toBe('Tel Aviv & coast');
  expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});

it('sends coordinates, including zero', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ temperature: 0 }) });
  vi.stubGlobal('fetch', fetch);
  await getWeather({ latitude: 0, longitude: -10 });
  expect(fetch.mock.calls[0][0]).toBe('/api/weather?latitude=0&longitude=-10');
});

it('surfaces API and network errors', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Unavailable' }) });
  vi.stubGlobal('fetch', fetch);
  await expect(searchCities('London')).rejects.toThrow('Unavailable');
  fetch.mockRejectedValueOnce(new TypeError('Offline'));
  await expect(searchCities('London')).rejects.toThrow('Offline');
});
