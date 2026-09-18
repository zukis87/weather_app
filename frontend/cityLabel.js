export const cityLabel = (city) =>
  [city.name, city.admin1, city.country].filter(Boolean).join(', ');
