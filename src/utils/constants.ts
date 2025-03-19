// constants.ts
export const TON_PRICE_USD = 3.61;
export const TON_CLIENT_ENDPOINT = 'https://mainnet-v4.tonhubapi.com';
export const FACTORY_ADDRESS = 'EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67';
export const GAS_AMOUNT_TON = '0.1705';
export const GAS_AMOUNT_JETTON = '0.175';

// Define the list of jettons
export interface Jetton {
  name: string;
  address: string;
  image: string;
  priceUsd: number;
  rateToTon: number; // Calculated as TON_PRICE_USD / jetton.priceUsd
}

export const JETTONS: Jetton[] = [
  {
    name: 'SC',
    address: 'EQB9QBqniFI0jOmw3PU6v1v4LU3Sivm9yPXDDB9Qf7cXTDft',
    image: 'https://simple-coin.xyz/sc.png',
    priceUsd: 0.00359,
    rateToTon: TON_PRICE_USD / 0.00359,
  },
  // Example of adding another jetton
  {
    name: 'DUST',
    address: 'EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE', // Replace with actual address
    image: 'https://cache.tonapi.io/imgproxy/rJ4qAiXZRWvGV6CCF8jHz-qE0-hmqWMUkI9BDDrfaXc/rs:fill:200:200:1/g:no/aXBmczovL1FtYVpuOHkzSm5kcmVQamVVYkRRdEJ5UFY2ZXpId1A2N3BWYUpHM1dXcGFtTEI.webp', // Replace with actual image URL
    priceUsd: 0.004, // Example price
    rateToTon: TON_PRICE_USD / 0.004,
  },
];

// TON details (not part of the selectable jettons but used for display)
export const TON = {
  name: 'TON',
  image: 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  priceUsd: TON_PRICE_USD,
};