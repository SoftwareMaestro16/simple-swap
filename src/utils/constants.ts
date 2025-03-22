import axios from 'axios';

export const TON_CLIENT_ENDPOINT = 'https://mainnet-v4.tonhubapi.com';
export const FACTORY_ADDRESS = 'EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67';
export const GAS_AMOUNT_TON = '0.0905';
export const GAS_AMOUNT_JETTON = '0.095';

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
    priceUsd: 0, 
};

export const JETTONS: Jetton[] = [
    {
        name: 'SC',
        address: 'EQB9QBqniFI0jOmw3PU6v1v4LU3Sivm9yPXDDB9Qf7cXTDft',
        image: 'https://simple-coin.xyz/sc.png',
        priceUsd: 0,
        rateToTon: TON.priceUsd / 1, 
    },
    {
        name: 'MOMMY',
        address: 'EQC7i_DnbtjZHw8GTNv6C4Qq7RuAiYdg6L5NxIaJFj39PP56',
        image: 'https://i.ibb.co/BVqtXmJx/mommy.jpg',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'BOLT',
        address: 'EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw',
        image: 'https://cache.tonapi.io/imgproxy/05DkTmM2Eu4YZX-ED0eQpRS8U1q7SbD3o1GC5r5ZTBw/rs:fill:200:200:1/g:no/aHR0cHM6Ly9jbG91ZGZsYXJlLWlwZnMuY29tL2lwZnMvUW1YNDdkb2RVZzFhY1hveFlEVUxXVE5mU2hYUlc1dUhyQ21vS1NVTlI5eEtRdw.webp',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'GMOON',
        address: 'EQCYbpjD20bBjX6w_n8ejVt43l_w4ON9E5Y5WqjJSe7d1KFo',
        image: 'https://giveaways.moon-reward.tech/icon.png',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'TSP',
        address: 'EQAr6FVqQfktKsjhDhtk-sQnjXsOjehpf6Wr_TPozGbW4Dhx',
        image: 'https://d121vty759npai.cloudfront.net/images/15da91530f7f41eb8e174f1e402867a8.jpeg',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'LIS',
        address: 'EQCb_6sQiXnaC92uxxJOEVETIRzloSGkRFzYERHlyLNgobdG',
        image: 'https://i.ibb.co/frsmLRB/Token-Crypto-Lisa.png',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'SOTA',
        address: 'EQCi9nWtRY5rdEWkZIPOe_9n1WXog8ObXCIf6RGmwFCnrrT8',
        image: 'https://beetontoken.space/wp-content/uploads/2025/02/sota_word.png',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'BEE',
        address: 'EQCRU1SC3xNf_r33q8NZzLughmvdE21JRYIZj4oRKUdRKRDb',
        image: 'https://i.ibb.co/jJM88k7/photo-1.png',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    {
        name: 'MED',
        address: 'EQAinL89RPbfhofyrhRsoU6L9_awtKhXTkraG9b7Bo_3HhSb',
        image: 'https://bee-ton.ru/wp-content/uploads/2024/04/med.png',
        priceUsd: 0, 
        rateToTon: TON.priceUsd / 1,
    },
    // {
    //     name: 'ARNI',
    //     address: 'EQAZzZzhBdrPwxFVQHWlMHbDY_eOk3LeUPr07VWdX4B0193M',
    //     image: 'https://static.tildacdn.com/tild3163-6438-4631-a534-373165636364/ARNI_Logo.png',
    //     priceUsd: 1, 
    //     rateToTon: TON.priceUsd / 1,
    // },
    // {
    //     name: 'JSI',
    //     address: 'EQBJpyjYjsZ5xhqClAgaSqVHlgFtsJvclU-93Ah-LequH5uC',
    //     image: 'https://i.ibb.co/RTNSCjrF/IMG-4242.png',
    //     priceUsd: 1, 
    //     rateToTon: TON.priceUsd / 1,
    // },
];