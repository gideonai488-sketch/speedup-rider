export type CountryCode = 'GH' | 'FI' | 'ET' | 'JM' | 'PH' | 'US';
export type CurrencyCode = 'GHS' | 'EUR' | 'ETB' | 'JMD' | 'PHP' | 'USD';
export type LanguageCode = 'en' | 'fi' | 'am' | 'fr';
export type PaymentGateway = 'paystack' | 'stripe' | 'telebirr' | 'gcash';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  defaultLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  paymentGateways: PaymentGateway[];
  paymentMethods: string[];
  timezone: string;
  phonePrefix: string;
  riderModel: 'freelance' | 'employee';
  vehicleTypes: string[];
  cities: string[];
  isActive: boolean;
  comingSoon?: boolean;
}

export const countries: Record<CountryCode, CountryConfig> = {
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    currencySymbol: 'GH₵',
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    paymentGateways: ['paystack'],
    paymentMethods: ['mobile_money', 'card', 'cash'],
    timezone: 'Africa/Accra',
    phonePrefix: '+233',
    riderModel: 'freelance',
    vehicleTypes: ['motorcycle', 'bicycle', 'car'],
    cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast'],
    isActive: true,
  },
  FI: {
    code: 'FI',
    name: 'Finland',
    flag: '🇫🇮',
    currency: 'EUR',
    currencySymbol: '€',
    defaultLanguage: 'fi',
    supportedLanguages: ['fi', 'en'],
    paymentGateways: ['stripe'],
    paymentMethods: ['card', 'mobilepay', 'bank_transfer'],
    timezone: 'Europe/Helsinki',
    phonePrefix: '+358',
    riderModel: 'employee',
    vehicleTypes: ['e-bike', 'bicycle', 'car'],
    cities: ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Oulu'],
    isActive: true,
  },
  ET: {
    code: 'ET',
    name: 'Ethiopia',
    flag: '🇪🇹',
    currency: 'ETB',
    currencySymbol: 'ETB',
    defaultLanguage: 'am',
    supportedLanguages: ['am', 'en'],
    paymentGateways: ['telebirr'],
    paymentMethods: ['telebirr', 'cash'],
    timezone: 'Africa/Addis_Ababa',
    phonePrefix: '+251',
    riderModel: 'freelance',
    vehicleTypes: ['motorcycle', 'bicycle', 'bajaj'],
    cities: ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar'],
    isActive: false,
    comingSoon: true,
  },
  JM: {
    code: 'JM',
    name: 'Jamaica',
    flag: '🇯🇲',
    currency: 'JMD',
    currencySymbol: 'J$',
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    paymentGateways: ['stripe'],
    paymentMethods: ['card', 'cash'],
    timezone: 'America/Jamaica',
    phonePrefix: '+1876',
    riderModel: 'freelance',
    vehicleTypes: ['motorcycle', 'car', 'bicycle'],
    cities: ['Kingston', 'Montego Bay', 'Spanish Town', 'Portmore'],
    isActive: false,
    comingSoon: true,
  },
  PH: {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    currency: 'PHP',
    currencySymbol: '₱',
    defaultLanguage: 'en',
    supportedLanguages: ['en'],
    paymentGateways: ['gcash', 'stripe'],
    paymentMethods: ['gcash', 'card', 'cash'],
    timezone: 'Asia/Manila',
    phonePrefix: '+63',
    riderModel: 'freelance',
    vehicleTypes: ['motorcycle', 'bicycle', 'car'],
    cities: ['Manila', 'Cebu', 'Davao', 'Quezon City'],
    isActive: false,
    comingSoon: true,
  },
};

export const activeCountries = Object.values(countries).filter(c => c.isActive);
export const allCountries = Object.values(countries);

export const formatCurrency = (amount: number, countryCode: CountryCode): string => {
  const country = countries[countryCode];
  return `${country.currencySymbol} ${amount.toFixed(2)}`;
};

export const getPaymentGatewayLabel = (gateway: PaymentGateway): string => {
  const labels: Record<PaymentGateway, string> = {
    paystack: 'Paystack',
    stripe: 'Stripe',
    telebirr: 'Telebirr',
    gcash: 'GCash',
  };
  return labels[gateway];
};
