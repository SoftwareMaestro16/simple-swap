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
import { TON, JETTONS } from '../utils/constants';

function InTg() {
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(true);
    const wallet = useTonWallet();
    const [tonAmount, setTonAmount] = useState('');
    const [jettonAmount, setJettonAmount] = useState('');
    const [isTonToJetton, setIsTonToJetton] = useState(true);
    const [selectedJetton, setSelectedJetton] = useState(JETTONS[0]); // Default to the first jetton (SC)
    const [showJettonListTop, setShowJettonListTop] = useState(false); // For the top field
    const [showJettonListBottom, setShowJettonListBottom] = useState(false); // For the bottom field

    const tonClient = initializeTonClient();
    const factory = setupFactory(tonClient);

    useEffect(() => {
        const checkReadiness = async () => {
            try {
                await checkPoolAndVaultReadiness(factory, selectedJetton.address);
                setIsReady(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка при инициализации');
                setIsReady(true);
                console.log('norm');
                
            }
        };
        checkReadiness();
    }, [factory, selectedJetton]);

    const handleJettonSelect = (jetton: typeof JETTONS[0]) => {
        console.log('Selected jetton:', jetton.name);
        setSelectedJetton(jetton);
        setJettonAmount('');
        setTonAmount('');
        setShowJettonListTop(false);
        setShowJettonListBottom(false);
    };

    const toggleJettonListTop = () => {
        if (!isTonToJetton) { // Only toggle if the top field is the jetton field
            console.log('Toggling jetton list for top field, current state:', showJettonListTop);
            setShowJettonListTop((prev) => !prev);
            setShowJettonListBottom(false); // Close the bottom list if open
        }
    };

    const toggleJettonListBottom = () => {
        if (isTonToJetton) { // Only toggle if the bottom field is the jetton field
            console.log('Toggling jetton list for bottom field, current state:', showJettonListBottom);
            setShowJettonListBottom((prev) => !prev);
            setShowJettonListTop(false); // Close the top list if open
        }
    };

    return (
        <>
            <div className={styles.tc}>
                <TonConnectButton />
            </div>
            <div className={styles.swapContainer}>
                <h2>Simple Swap</h2>
                
                <div>
                    {isReady && (
                        <div className={styles.swapFields}>
                            <div className={styles.field}>
                                <div className={styles['input-wrapper']}>
                                    <input
                                        type="number"
                                        value={isTonToJetton ? tonAmount : jettonAmount}
                                        onChange={(e) => updateAmounts(e.target.value, true, isTonToJetton, setTonAmount, setJettonAmount, selectedJetton.rateToTon)}
                                        placeholder="0.0"
                                    />
                                    <div
                                        className={styles.currencyContainer}
                                        onClick={toggleJettonListTop}
                                    >
                                        <h2>{isTonToJetton ? TON.name : selectedJetton.name}</h2>
                                        <img
                                            src={isTonToJetton ? TON.image : selectedJetton.image}
                                            alt={isTonToJetton ? TON.name : selectedJetton.name}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                    {showJettonListTop && !isTonToJetton && (
                                        <div className={styles.jettonList}>
                                            {JETTONS.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <img src={jetton.image} alt={jetton.name} className={styles.jettonImage} />
                                                    <span>{jetton.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.price}>
                                    ≈ ${(isTonToJetton ? (parseFloat(tonAmount) * TON.priceUsd || 0) : (parseFloat(jettonAmount) * selectedJetton.priceUsd || 0)).toFixed(2)}
                                </div>
                            </div>

                            <div className={styles.swapDivider}>
                                <div className={styles.dividerLine}></div>
                                <button
                                    className={styles['swap-button']}
                                    onClick={() => toggleSwapDirection(setIsTonToJetton, setTonAmount, setJettonAmount)}
                                >
                                    ↕
                                </button>
                                <div className={styles.dividerLine}></div>
                            </div>

                            <div className={styles.field}>
                                <div className={`${styles['input-wrapper']} ${styles.readonly}`}>
                                    <input
                                        type="number"
                                        value={isTonToJetton ? jettonAmount : tonAmount}
                                        readOnly
                                        placeholder="0.0"
                                    />
                                    <div
                                        className={styles.currencyContainer}
                                        onClick={toggleJettonListBottom}
                                    >
                                        <h2>{isTonToJetton ? selectedJetton.name : TON.name}</h2>
                                        <img
                                            src={isTonToJetton ? selectedJetton.image : TON.image}
                                            alt={isTonToJetton ? selectedJetton.name : TON.name}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                    {showJettonListBottom && isTonToJetton && (
                                        <div className={styles.jettonList}>
                                            {JETTONS.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <img src={jetton.image} alt={jetton.name} className={styles.jettonImage} />
                                                    <span>{jetton.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.price}>
                                    ≈ ${(isTonToJetton ? (parseFloat(jettonAmount) * selectedJetton.priceUsd || 0) : (parseFloat(tonAmount) * TON.priceUsd || 0)).toFixed(2)}
                                </div>
                            </div>

                            <div className={styles.rate}>1 TON = {selectedJetton.rateToTon.toFixed(2)} {selectedJetton.name}</div>
                            <button
                                onClick={isTonToJetton
                                    ? () => handleSwapTon(tonConnectUI, wallet, tonAmount, setError, setIsLoading, factory, selectedJetton.address)
                                    : () => handleSwapJetton(tonConnectUI, wallet, jettonAmount, setError, setIsLoading, factory, selectedJetton.address)}
                                disabled={isLoading || !tonConnectUI.connected || (!tonAmount && !jettonAmount)}
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