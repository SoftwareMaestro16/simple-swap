import { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import styles from './style.module.scss';
import {
    initializeTonClient,
    setupFactory,
    checkPoolAndVaultReadiness,
    handleSwapTon,
    handleSwapJetton,
    updateAmounts,
    toggleSwapDirection,
} from '../utils/swapLogic';
import { TON_PRICE_USD, SC_PRICE_USD, TON_TO_SC_RATE } from '../utils/constants';

function InTg() {
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const [_, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(true);
    const wallet = useTonWallet();
    const [tonAmount, setTonAmount] = useState('');
    const [scAmount, setScAmount] = useState('');
    const [isTonToSc, setIsTonToSc] = useState(true);

    const tonClient = initializeTonClient();
    const factory = setupFactory(tonClient);

    useEffect(() => {
        const checkReadiness = async () => {
            try {
                await checkPoolAndVaultReadiness(factory);
                setIsReady(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка при инициализации');
            }
        };
        checkReadiness();
    }, [factory]);

    return (
        <>
            <TonConnectButton />
            <div className={styles.swapContainer}>
                <h2>Swap</h2>
                
                <div>
                    {isReady && (
                        <div className={styles.swapFields}>
                            <div className={styles.field}>
                                <div className={styles['input-wrapper']}>
                                    <input
                                        type="number"
                                        value={isTonToSc ? tonAmount : scAmount}
                                        onChange={(e) => updateAmounts(e.target.value, true, isTonToSc, setTonAmount, setScAmount, TON_TO_SC_RATE)}
                                        placeholder="0.0"
                                    />
                                    <div className={styles.currencyContainer}>
                                        <h2>{isTonToSc ? 'TON' : 'SC'}</h2>
                                        <img
                                            src={isTonToSc ? 'https://cryptologos.cc/logos/toncoin-ton-logo.png' : 'https://simple-coin.xyz/sc.png'}
                                            alt={isTonToSc ? 'TON' : 'SC'}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                </div>
                                <div className={styles.price}>
                                    ≈ ${(isTonToSc ? (parseFloat(tonAmount) * TON_PRICE_USD || 0) : (parseFloat(scAmount) * SC_PRICE_USD || 0)).toFixed(2)}
                                </div>
                            </div>

                            <div className={styles.swapDivider}>
                                <div className={styles.dividerLine}></div>
                                <button
                                    className={styles['swap-button']}
                                    onClick={() => toggleSwapDirection(setIsTonToSc, setTonAmount, setScAmount)}
                                >
                                    ↕
                                </button>
                                <div className={styles.dividerLine}></div>
                            </div>

                            <div className={styles.field}>
                                <div className={`${styles['input-wrapper']} ${styles.readonly}`}>
                                    <input
                                        type="number"
                                        value={isTonToSc ? scAmount : tonAmount}
                                        readOnly
                                        placeholder="0.0"
                                    />
                                    <div className={styles.currencyContainer}>
                                        <h2>{isTonToSc ? 'SC' : 'TON'}</h2>
                                        <img
                                            src={isTonToSc ? 'https://simple-coin.xyz/sc.png' : 'https://cryptologos.cc/logos/toncoin-ton-logo.png'}
                                            alt={isTonToSc ? 'SC' : 'TON'}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                </div>
                                <div className={styles.price}>
                                    ≈ ${(isTonToSc ? (parseFloat(scAmount) * SC_PRICE_USD || 0) : (parseFloat(tonAmount) * TON_PRICE_USD || 0)).toFixed(2)}
                                </div>
                            </div>

                            <div className={styles.rate}>1 TON = {TON_TO_SC_RATE.toFixed(2)} SC</div>
                            <button
                                onClick={isTonToSc ? () => handleSwapTon(tonConnectUI, wallet, tonAmount, setError, setIsLoading, factory) : () => handleSwapJetton(tonConnectUI, wallet, scAmount, setError, setIsLoading, factory)}
                                disabled={isLoading || !tonConnectUI.connected || (!tonAmount && !scAmount)}
                            >
                                {isLoading ? 'Выполняется...' : `Swap`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default InTg;