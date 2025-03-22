import { Factory, Asset, PoolType, ReadinessStatus } from '@dedust/sdk';
import { Address, TonClient4, toNano, beginCell } from '@ton/ton';
import { toUserFriendlyAddress } from '@tonconnect/ui-react';
import { getJettonWalletAddress } from '../tonapi';
import { FACTORY_ADDRESS, GAS_AMOUNT_TON, GAS_AMOUNT_JETTON, TON_CLIENT_ENDPOINT } from './constants';

export const initializeTonClient = () => new TonClient4({ endpoint: TON_CLIENT_ENDPOINT });

export const setupFactory = (tonClient: TonClient4) => {
    const factoryAddress = Address.parse(FACTORY_ADDRESS);
    return tonClient.open(Factory.createFromAddress(factoryAddress));
};

export const checkPoolAndVaultReadiness = async (factory: any, jettonAddress: string) => {
    console.log('Checking pool and vault readiness for jetton:', jettonAddress);
    const tonVault = await factory.getNativeVault();
    const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(jettonAddress))]);

    const poolStatus = await pool.getReadinessStatus();
    const vaultStatus = await tonVault.getReadinessStatus();

    console.log('Pool readiness status:', poolStatus);
    console.log('Vault readiness status:', vaultStatus);

    if (poolStatus !== ReadinessStatus.READY) {
        throw new Error(`Пул TON/${jettonAddress} не существует или не готов`);
    }
    if (vaultStatus !== ReadinessStatus.READY) {
        throw new Error('TON Vault не существует или не готов');
    }
    return { tonVault, pool };
};

export const handleSwapTon = async (
    tonConnectUI: any,
    wallet: any,
    tonAmount: string,
    setError: (error: string | null) => void,
    setIsLoading: (loading: boolean) => void,
    factory: any,
    jettonAddress: string
) => {
    if (!tonConnectUI) {
        setError('TonConnect UI не инициализирован');
        return;
    }
    if (!tonConnectUI.connected || !wallet) {
        setError('Сначала подключите кошелек');
        return;
    }

    try {
        setIsLoading(true);
        setError(null);

        const tonVault = await factory.getNativeVault();
        const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(jettonAddress))]);

        if (!tonVault || !pool) {
            throw new Error('Не удалось получить данные о вольте или пуле');
        }

        const amountIn = toNano(tonAmount || '0');
        const gasAmount = toNano(GAS_AMOUNT_TON);

        const swapPayload = beginCell()
            .storeUint(0xea06185d, 32)
            .storeUint(0, 64)
            .storeCoins(amountIn)
            .storeAddress(pool.address)
            .storeUint(0, 1)
            .storeCoins(0)
            .storeMaybeRef(null)
            .storeRef(
                beginCell()
                    .storeUint(0, 32)
                    .storeAddress(Address.parse(toUserFriendlyAddress(wallet.account.address)))
                    .storeAddress(Address.parse(toUserFriendlyAddress(wallet.account.address)))
                    .storeMaybeRef(null)
                    .storeMaybeRef(null)
                .endCell()
            )
            .endCell();

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{
                address: tonVault.address.toString(),
                amount: (amountIn + gasAmount).toString(),
                payload: swapPayload.toBoc().toString('base64')
            }]
        };

        console.log('Sending TON-to-Jetton transaction:', transaction);
        await tonConnectUI.sendTransaction(transaction);
    } catch (err) {
        console.error('Error in handleSwapTon:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа TON-to-Jetton');
    } finally {
        setIsLoading(false);
    }
};

export const handleSwapJetton = async (
    tonConnectUI: any,
    wallet: any,
    jettonAmount: string,
    setError: (error: string | null) => void,
    setIsLoading: (loading: boolean) => void,
    factory: any,
    jettonAddress: string
) => {
    if (!tonConnectUI) {
        setError('TonConnect UI не инициализирован');
        return;
    }
    if (!tonConnectUI.connected || !wallet) {
        setError('Сначала подключите кошелек');
        return;
    }

    try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching jetton wallet address for:', jettonAddress, 'and wallet:', wallet.account.address);
        const jwAddress = await getJettonWalletAddress(Address.parse(jettonAddress).toRawString(), wallet.account.address);
        console.log('Jetton wallet address:', jwAddress.toString());

        const jettonVault = await factory.getJettonVault(Address.parse(jettonAddress));
        const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(jettonAddress))]);

        if (!jettonVault || !pool) {
            throw new Error('Не удалось получить данные о jetton vault или пуле');
        }

        const amountIn = toNano(jettonAmount || '0');
        const gasAmount = toNano(GAS_AMOUNT_JETTON);

        const forwardPayload = beginCell()
            .storeUint(0xe3a0d482, 32)
            .storeAddress(pool.address)
            .storeUint(0, 1)
            .storeCoins(0)
            .storeMaybeRef(null)
            .storeRef(
                beginCell()
                    .storeUint(0, 32)
                    .storeAddress(Address.parse(toUserFriendlyAddress(wallet.account.address)))
                    .storeAddress(Address.parse(toUserFriendlyAddress(wallet.account.address)))
                    .storeMaybeRef(null)
                    .storeMaybeRef(null)
                .endCell()
            )
            .endCell();

        const swapPayload = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(amountIn)
            .storeAddress(jettonVault.address)
            .storeUint(0, 2)
            .storeUint(0, 1)
            .storeCoins(gasAmount)
            .storeBit(1)
            .storeMaybeRef(forwardPayload)
            .endCell();

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [{
                address: jwAddress.toString(),
                amount: toNano('0.145').toString(),
                payload: swapPayload.toBoc().toString('base64')
            }]
        };

        console.log('Sending Jetton-to-TON transaction:', transaction);
        await tonConnectUI.sendTransaction(transaction);
    } catch (err) {
        console.error('Error in handleSwapJetton:', err);
        setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа Jetton-to-TON');
    } finally {
        setIsLoading(false);
    }
};

export const updateAmounts = (
    value: string,
    isFrom: boolean,
    isTonToJetton: boolean,
    setTonAmount: (value: string) => void,
    setJettonAmount: (value: string) => void,
    rateToTon: number
) => {
    if (!rateToTon) return;
    const amount = parseFloat(value) || 0;
    if (isFrom) {
        if (isTonToJetton) {
            setTonAmount(value);
            setJettonAmount((amount * rateToTon).toFixed(6));
        } else {
            setJettonAmount(value);
            setTonAmount((amount / rateToTon).toFixed(6));
        }
    } else {
        if (isTonToJetton) {
            setJettonAmount(value);
            setTonAmount((amount / rateToTon).toFixed(6));
        } else {
            setTonAmount(value);
            setJettonAmount((amount * rateToTon).toFixed(6));
        }
    }
};

export const toggleSwapDirection = (
    setIsTonToJetton: (value: (prev: boolean) => boolean) => void,
    setTonAmount: (value: string) => void,
    setJettonAmount: (value: string) => void
) => {
    setIsTonToJetton((prev: boolean) => !prev);
    setTonAmount('');
    setJettonAmount('');
};