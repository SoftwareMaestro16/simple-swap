import axios from 'axios';

export const TON_CLIENT_ENDPOINT = 'https://mainnet-v4.tonhubapi.com';
export const FACTORY_ADDRESS = 'EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67';
export const GAS_AMOUNT_TON = '0.1705';
export const GAS_AMOUNT_JETTON = '0.175';

export async function getTonPrice(): Promise<number | null> {
    const API_URL = 'https://api.geckoterminal.com/api/v2/networks/ton/tokens/EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

    try {
        const response = await axios.get(API_URL);
        const price = response.data?.data?.attributes?.price_usd;
        return price ? parseFloat(price) : null;
    } catch (error) {
        console.error('Error fetching TON price:', error instanceof Error ? error.message : error);
        return null;
    }
}

export async function getJettonPrice(address: string): Promise<{ price: number | null; fdv_usd: number | null }> {
    const API_URL = `https://api.geckoterminal.com/api/v2/networks/ton/tokens/${address}`;

    try {
        const response = await axios.get(API_URL);
        const price = response.data?.data?.attributes?.price_usd;
        const fdv = response.data?.data?.attributes?.fdv_usd;

        return {
            price: price ? parseFloat(price) : null,
            fdv_usd: fdv ? parseFloat(fdv) : null,
        };
    } catch (error) {
        console.error('Error fetching jetton price:', error instanceof Error ? error.message : error);
        return { price: null, fdv_usd: null };
    }
}

export interface Jetton {
    name: string;
    address: string;
    image: string;
    priceUsd: number;
    rateToTon: number;
}

export const TON = {
    name: 'TON',
    image: 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
    priceUsd: 1, 
};

export const JETTONS: Jetton[] = [
    {
        name: 'SC',
        address: 'EQB9QBqniFI0jOmw3PU6v1v4LU3Sivm9yPXDDB9Qf7cXTDft',
        image: 'https://simple-coin.xyz/sc.png',
        priceUsd: 1,
        rateToTon: TON.priceUsd / 1, 
    },
    {
        name: 'MOMMY',
        address: 'EQC7i_DnbtjZHw8GTNv6C4Qq7RuAiYdg6L5NxIaJFj39PP56',
        image: 'https://i.ibb.co/BVqtXmJx/mommy.jpg',
        priceUsd: 1, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'ARNI',
        address: 'EQAZzZzhBdrPwxFVQHWlMHbDY_eOk3LeUPr07VWdX4B0193M',
        image: 'https://static.tildacdn.com/tild3163-6438-4631-a534-373165636364/ARNI_Logo.png',
        priceUsd: 1, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'JSI',
        address: 'EQBJpyjYjsZ5xhqClAgaSqVHlgFtsJvclU-93Ah-LequH5uC',
        image: 'https://i.ibb.co/RTNSCjrF/IMG-4242.png',
        priceUsd: 1, 
        rateToTon: TON.priceUsd / 1,
    },
];