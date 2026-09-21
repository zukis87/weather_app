import React from 'react';

const paths = {
  location: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" fill="#f7a49b" stroke="#b94d49" /><circle cx="12" cy="10" r="2.5" fill="#fff5ec" stroke="#b94d49" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" fill="#d9efff" stroke="#287bb5" /><path d="m16 16 4.5 4.5" stroke="#245a86" strokeWidth="3" /><path d="M7.5 9a4 4 0 0 1 3.3-2" stroke="white" /></>,
  star: <path fill="#f5c542" stroke="#bf8613" d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9Z" />,
  globe: <><circle cx="12" cy="12" r="9" fill="#79c8ef" stroke="#287bb5" /><path d="m7 5 4-1 2 3-2 3-3 1-1 4-3-3 1-4Z" fill="#62b87c" stroke="#388858" strokeWidth="1" /><path d="m15 12 4 1 1 3-3 3-2-1-2-3Z" fill="#79c78a" stroke="#388858" strokeWidth="1" /></>,
};

const TabIcon = ({ name }) => (
  <svg className="tab-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {paths[name]}
  </svg>
);

export default TabIcon;
