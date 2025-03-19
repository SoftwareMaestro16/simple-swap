import { useState, useEffect, useRef } from 'react';
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
    const [_, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(true);
    const wallet = useTonWallet();
    const [tonAmount, setTonAmount] = useState('');
    const [jettonAmount, setJettonAmount] = useState('');
    const [isTonToJetton, setIsTonToJetton] = useState(true);
    const [selectedJetton, setSelectedJetton] = useState(JETTONS[0]);
    const [showJettonListTop, setShowJettonListTop] = useState(false);
    const [showJettonListBottom, setShowJettonListBottom] = useState(false);

    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const jettonListTopRef = useRef<HTMLDivElement>(null);
    const jettonListBottomRef = useRef<HTMLDivElement>(null);

    const tonClient = initializeTonClient();
    const factory = setupFactory(tonClient);

    useEffect(() => {
        const checkReadiness = async () => {
            try {
                await checkPoolAndVaultReadiness(factory, selectedJetton.address);
                setIsReady(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error during initialization');
                setIsReady(true);
                console.log('norm');
            }
        };
        checkReadiness();
    }, [factory, selectedJetton]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                topRef.current &&
                jettonListTopRef.current &&
                !topRef.current.contains(target) &&
                !jettonListTopRef.current.contains(target)
            ) {
                setShowJettonListTop(false);
            }

            if (
                bottomRef.current &&
                jettonListBottomRef.current &&
                !bottomRef.current.contains(target) &&
                !jettonListBottomRef.current.contains(target)
            ) {
                setShowJettonListBottom(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleJettonSelect = (jetton: typeof JETTONS[0]) => {
        console.log('Selected jetton:', jetton.name);
        setSelectedJetton(jetton);
        setJettonAmount('');
        setTonAmount('');
        setShowJettonListTop(false);
        setShowJettonListBottom(false);
    };

    const toggleJettonListTop = () => {
        console.log('toggleJettonListTop called');
        setShowJettonListTop((prev) => !prev);
        setShowJettonListBottom(false);
    };

    const toggleJettonListBottom = () => {
        console.log('toggleJettonListBottom called');
        setShowJettonListBottom((prev) => !prev);
        setShowJettonListTop(false);
    };

    return (
        <>
            <div className={styles.tc}>
                <TonConnectButton />
            </div>
            <div className={styles.swapContainer}>
                <h2>Simple Swap</h2>
                <div className={styles.marqueeContainer}>
                    <div className={styles.marquee}>
                        Simple Swap offers lower fees for exchanges. Be cautious: reward tokens may have additional swap percentages.
                    </div>
                </div>

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
                                        ref={topRef}
                                        className={styles.currencyContainer}
                                        onClick={!isTonToJetton ? toggleJettonListTop : undefined}
                                    >
                                        <h2>{isTonToJetton ? TON.name : selectedJetton.name}</h2>
                                        <img
                                            src={isTonToJetton ? TON.image : selectedJetton.image}
                                            alt={isTonToJetton ? TON.name : selectedJetton.name}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                    {showJettonListTop && !isTonToJetton && (
                                        <div ref={jettonListTopRef} className={styles.jettonList}>
                                            {JETTONS.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <span>{jetton.name}</span>
                                                    <img src={jetton.image} alt={jetton.name} className={styles.jettonImage} />
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
                                        ref={bottomRef}
                                        className={styles.currencyContainer}
                                        onClick={isTonToJetton ? toggleJettonListBottom : undefined}
                                    >
                                        <h2>{isTonToJetton ? selectedJetton.name : TON.name}</h2>
                                        <img
                                            src={isTonToJetton ? selectedJetton.image : TON.image}
                                            alt={isTonToJetton ? selectedJetton.name : TON.name}
                                            className={styles.currencyImage}
                                        />
                                    </div>
                                    {showJettonListBottom && isTonToJetton && (
                                        <div ref={jettonListBottomRef} className={styles.jettonList}>
                                            {JETTONS.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <span>{jetton.name}</span>
                                                    <img src={jetton.image} alt={jetton.name} className={styles.jettonImage} />
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
                                {isLoading ? 'Processing...' : `Swap`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default InTg;