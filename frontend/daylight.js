export const minutes = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? '')
  ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) : null;

export const daylight = (sunrise, sunset, observation) => {
  const start = minutes(sunrise);
  const end = minutes(sunset);
  const now = minutes(observation?.slice(11, 16));
  return start === null || end === null || end <= start || now === null ? null : {
    start, end,
    duration: end - start,
    remaining: Math.max(0, end - Math.max(start, now)),
    progress: Math.max(0, Math.min(100, (now - start) / (end - start) * 100)),
    phase: now < start ? 'Before sunrise' : now >= end ? 'After sunset' : 'Daylight',
  };
};

