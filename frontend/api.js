// HTTP communication is separate from React components.
const request = async (path, parameters) => {
  const response = await fetch(`${path}?${new URLSearchParams(parameters)}`, {
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The request failed. Try again.');
  return data;
};

export const searchCities = (name) => request('/api/cities', { name });
export const getWeather = (city) => request('/api/weather', {
  latitude: city.latitude,
  longitude: city.longitude,
});
