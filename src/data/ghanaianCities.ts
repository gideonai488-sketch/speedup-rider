// Major cities and regions in Ghana for auth selection
export const ghanaianCities = [
  // Greater Accra Region
  { value: 'accra', label: 'Accra', region: 'Greater Accra' },
  { value: 'tema', label: 'Tema', region: 'Greater Accra' },
  { value: 'madina', label: 'Madina', region: 'Greater Accra' },
  { value: 'east-legon', label: 'East Legon', region: 'Greater Accra' },
  { value: 'kasoa', label: 'Kasoa', region: 'Greater Accra' },
  
  // Ashanti Region
  { value: 'kumasi', label: 'Kumasi', region: 'Ashanti' },
  { value: 'obuasi', label: 'Obuasi', region: 'Ashanti' },
  { value: 'ejisu', label: 'Ejisu', region: 'Ashanti' },
  
  // Western Region
  { value: 'takoradi', label: 'Takoradi', region: 'Western' },
  { value: 'sekondi', label: 'Sekondi', region: 'Western' },
  
  // Central Region
  { value: 'cape-coast', label: 'Cape Coast', region: 'Central' },
  { value: 'winneba', label: 'Winneba', region: 'Central' },
  
  // Eastern Region
  { value: 'koforidua', label: 'Koforidua', region: 'Eastern' },
  { value: 'nkawkaw', label: 'Nkawkaw', region: 'Eastern' },
  
  // Volta Region
  { value: 'ho', label: 'Ho', region: 'Volta' },
  { value: 'hohoe', label: 'Hohoe', region: 'Volta' },
  
  // Northern Region
  { value: 'tamale', label: 'Tamale', region: 'Northern' },
  { value: 'yendi', label: 'Yendi', region: 'Northern' },
  
  // Upper East Region
  { value: 'bolgatanga', label: 'Bolgatanga', region: 'Upper East' },
  { value: 'navrongo', label: 'Navrongo', region: 'Upper East' },
  
  // Upper West Region
  { value: 'wa', label: 'Wa', region: 'Upper West' },
  
  // Bono Region
  { value: 'sunyani', label: 'Sunyani', region: 'Bono' },
  { value: 'techiman', label: 'Techiman', region: 'Bono East' },
  
  // Oti Region
  { value: 'dambai', label: 'Dambai', region: 'Oti' },
  
  // Savannah Region
  { value: 'damongo', label: 'Damongo', region: 'Savannah' },
  
  // North East Region
  { value: 'nalerigu', label: 'Nalerigu', region: 'North East' },
  
  // Ahafo Region
  { value: 'goaso', label: 'Goaso', region: 'Ahafo' },
  
  // Western North Region
  { value: 'sefwi-wiawso', label: 'Sefwi Wiawso', region: 'Western North' },
];

// Group cities by region for better UX
export const getCitiesByRegion = () => {
  const grouped: Record<string, typeof ghanaianCities> = {};
  ghanaianCities.forEach(city => {
    if (!grouped[city.region]) {
      grouped[city.region] = [];
    }
    grouped[city.region].push(city);
  });
  return grouped;
};
