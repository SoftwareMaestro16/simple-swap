import { Factory, Asset, PoolType, ReadinessStatus } from '@dedust/sdk';
import { Address, TonClient4, toNano, beginCell } from '@ton/ton';
import { toUserFriendlyAddress } from '@tonconnect/ui-react';
import { getJettonWalletAddress } from '../tonapi';
import { FACTORY_ADDRESS, SIMPLE_COIN_ADDRESS, GAS_AMOUNT_TON, GAS_AMOUNT_JETTON, TON_CLIENT_ENDPOINT, TON_TO_SC_RATE } from './constants';

export const initializeTonClient = () => new TonClient4({ endpoint: TON_CLIENT_ENDPOINT });

export const setupFactory = (tonClient: TonClient4) => {
    const factoryAddress = Address.parse(FACTORY_ADDRESS);
    return tonClient.open(Factory.createFromAddress(factoryAddress));
};

export const checkPoolAndVaultReadiness = async (factory: any) => {
    const tonVault = await factory.getNativeVault();
    const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(SIMPLE_COIN_ADDRESS))]);

    if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('Пул TON/SCALE не существует');
    }
    if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
        throw new Error('TON Vault не существует');
    }
    return { tonVault, pool };
};

export const handleSwapTon = async (
    tonConnectUI: any,
    wallet: any,
    tonAmount: string,
    setError: (error: string | null) => void,
    setIsLoading: (loading: boolean) => void,
    factory: any
) => {
    if (!tonConnectUI.connected || !wallet) {
        setError('Сначала подключите кошелек');
        return;
    }

    try {
        setIsLoading(true);
        setError(null);

        const tonVault = await factory.getNativeVault();
        const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(SIMPLE_COIN_ADDRESS))]);

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

        await tonConnectUI.sendTransaction(transaction);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа');
    } finally {
        setIsLoading(false);
    }
};

export const handleSwapJetton = async (
    tonConnectUI: any,
    wallet: any,
    scAmount: string,
    setError: (error: string | null) => void,
    setIsLoading: (loading: boolean) => void,
    factory: any
) => {
    if (!tonConnectUI.connected || !wallet) {
        setError('Сначала подключите кошелек');
        return;
    }

    const jwAddress = await getJettonWalletAddress(Address.parse(SIMPLE_COIN_ADDRESS).toRawString(), wallet!.account.address);

    try {
        setIsLoading(true);
        setError(null);

        const jettonVault = await factory.getJettonVault(Address.parse(SIMPLE_COIN_ADDRESS));
        const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(Address.parse(SIMPLE_COIN_ADDRESS))]);

        const amountIn = toNano(scAmount || '0');
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
                amount: toNano('0.21').toString(),
                payload: swapPayload.toBoc().toString('base64')
            }]
        };

        await tonConnectUI.sendTransaction(transaction);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа');
    } finally {
        setIsLoading(false);
    }
};

export const updateAmounts = (
    value: string,
    isTopField: boolean,
    isTonToSc: boolean,
    setTonAmount: (value: string) => void,
    setScAmount: (value: string) => void,
    tonToScRate: number = TON_TO_SC_RATE 
) => {
    if (isTopField) {
        if (isTonToSc) {
            setTonAmount(value);
            const ton = parseFloat(value) || 0;
            setScAmount((ton * tonToScRate).toFixed(4));
        } else {
            setScAmount(value);
            const sc = parseFloat(value) || 0;
            setTonAmount((sc / tonToScRate).toFixed(4));
        }
    }
};

export const toggleSwapDirection = (
    setIsTonToSc: (value: (prev: boolean) => boolean) => void,
    setTonAmount: (value: string) => void,
    setScAmount: (value: string) => void
) => {
    setIsTonToSc((prev: boolean) => !prev);
    setTonAmount('');
    setScAmount('');
};