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
import { TON, JETTONS, getTonPrice, getJettonPrice } from '../utils/constants';
import Footer from '../Footer/Footer';

function InTg() {
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(true);
    const [isPriceLoading, setIsPriceLoading] = useState(true); // Новое состояние для загрузки цен
    const wallet = useTonWallet();
    const CONNECTED_WALLET = wallet?.account?.address;
    const [tonAmount, setTonAmount] = useState('');
    const [jettonAmount, setJettonAmount] = useState('');
    const [isTonToJetton, setIsTonToJetton] = useState(true);
    const [selectedJetton, setSelectedJetton] = useState(JETTONS[0]);
    const [showJettonListTop, setShowJettonListTop] = useState(false);
    const [showJettonListBottom, setShowJettonListBottom] = useState(false);
    const [tonPrice, setTonPrice] = useState(TON.priceUsd);
    const [jettons, setJettons] = useState(JETTONS);
    const [tonBalance, setTonBalance] = useState(0);
    const [jettonBalance, setJettonBalance] = useState(0);

    const topRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const jettonListTopRef = useRef<HTMLDivElement | null>(null);
    const jettonListBottomRef = useRef<HTMLDivElement | null>(null);

    const tonClient = initializeTonClient();
    const factory = setupFactory(tonClient);

    // Функция для получения цены TON с повторными попытками
    const fetchTonPriceWithRetry = async (retries = 3, delay = 2000): Promise<number | null> => {
        for (let i = 0; i < retries; i++) {
            const price = await getTonPrice();
            if (price !== null) return price;
            if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
        }
        setError('Failed to fetch TON price after retries');
        return null;
    };

    // Функция для получения цен Jetton с повторными попытками
    const fetchJettonPricesWithRetry = async (retries = 3, delay = 2000) => {
        const updatedJettons = await Promise.all(
            JETTONS.map(async (jetton) => {
                for (let i = 0; i < retries; i++) {
                    const { price } = await getJettonPrice(jetton.address);
                    if (price !== null) {
                        return {
                            ...jetton,
                            priceUsd: price,
                            rateToTon: tonPrice && price ? tonPrice / price : jetton.rateToTon,
                        };
                    }
                    if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
                }
                return jetton; // Возвращаем исходный Jetton, если цена не получена
            })
        );
        return updatedJettons;
    };

    useEffect(() => {
        const fetchPrices = async () => {
            setIsPriceLoading(true);
            const tonPriceResult = await fetchTonPriceWithRetry();
            if (tonPriceResult) {
                setTonPrice(tonPriceResult);
                const updatedJettons = await fetchJettonPricesWithRetry();
                setJettons(updatedJettons);
                const updatedSelected = updatedJettons.find((j) => j.address === selectedJetton.address);
                if (updatedSelected) setSelectedJetton(updatedSelected);
            }
            setIsPriceLoading(false);
        };
        fetchPrices();
    }, []); // Запускаем только при монтировании

    useEffect(() => {
        const checkReadiness = async () => {
            try {
                await checkPoolAndVaultReadiness(factory, selectedJetton.address);
                setIsReady(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error during initialization');
                setIsReady(true);
            }
        };
        checkReadiness();
    }, [factory, selectedJetton]);

    // Остальные useEffect для обработки кликов вне списка и балансов остаются без изменений

    const handleJettonSelect = (jetton: typeof JETTONS[0]) => {
        setSelectedJetton(jetton);
        setJettonAmount('');
        setTonAmount('');
        setShowJettonListTop(false);
        setShowJettonListBottom(false);
    };

    const toggleJettonListTop = () => {
        setShowJettonListTop((prev) => !prev);
        setShowJettonListBottom(false);
    };

    const toggleJettonListBottom = () => {
        setShowJettonListBottom((prev) => !prev);
        setShowJettonListTop(false);
    };

    const isInsufficientBalance = () => {
        const inputAmount = parseFloat(isTonToJetton ? tonAmount : jettonAmount) || 0;
        return isTonToJetton ? inputAmount > tonBalance : inputAmount > jettonBalance;
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
                    {isPriceLoading ? (
                        <></> ) : isReady ? (
                        <div className={styles.swapFields}>
                            <div className={styles.field}>
                                <div className={styles['input-wrapper']}>
                                    <input
                                        type="number"
                                        value={isTonToJetton ? tonAmount : jettonAmount}
                                        onChange={(e) =>
                                            updateAmounts(
                                                e.target.value,
                                                true,
                                                isTonToJetton,
                                                setTonAmount,
                                                setJettonAmount,
                                                selectedJetton.rateToTon
                                            )
                                        }
                                        placeholder="0"
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
                                            {jettons.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <span>{jetton.name}</span>
                                                    <img
                                                        src={jetton.image}
                                                        alt={jetton.name}
                                                        className={styles.jettonImage}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.price}>
                                    ≈ $
                                    {(isTonToJetton
                                        ? parseFloat(tonAmount) * tonPrice || 0
                                        : parseFloat(jettonAmount) * selectedJetton.priceUsd || 0
                                    ).toFixed(2)}
                                    <div>
                                        <span
                                            className={styles.max}
                                            onClick={() => {
                                                const maxAmount = isTonToJetton ? tonBalance : jettonBalance;
                                                updateAmounts(
                                                    maxAmount.toString(),
                                                    true,
                                                    isTonToJetton,
                                                    setTonAmount,
                                                    setJettonAmount,
                                                    selectedJetton.rateToTon
                                                );
                                            }}
                                        >
                                            Max
                                        </span>
                                        <span className={styles.balance}>
                                            {(isTonToJetton ? tonBalance : jettonBalance).toFixed(2) || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.swapDivider}>
                                <div className={styles.dividerLine}></div>
                                <button
                                    className={styles['swap-button']}
                                    onClick={() => toggleSwapDirection(setIsTonToJetton, setTonAmount, setJettonAmount)}
                                >
                                    <img src="/swap.png" alt="" />
                                </button>
                                <div className={styles.dividerLine}></div>
                            </div>
                            <div className={styles.field}>
                                <div className={`${styles['input-wrapper']} ${styles.readonly}`}>
                                    <input
                                        type="number"
                                        value={isTonToJetton ? jettonAmount : tonAmount}
                                        readOnly
                                        placeholder="0.00"
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
                                            {jettons.map((jetton) => (
                                                <div
                                                    key={jetton.address}
                                                    className={styles.jettonItem}
                                                    onClick={() => handleJettonSelect(jetton)}
                                                >
                                                    <span>{jetton.name}</span>
                                                    <img
                                                        src={jetton.image}
                                                        alt={jetton.name}
                                                        className={styles.jettonImage}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.price}>
                                    ≈ $
                                    {(isTonToJetton
                                        ? parseFloat(jettonAmount) * selectedJetton.priceUsd || 0
                                        : parseFloat(tonAmount) * tonPrice || 0
                                    ).toFixed(2)}
                                    <span className={styles.balance}>
                                        {(isTonToJetton ? jettonBalance : tonBalance).toFixed(2) || 0}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.rate}>
                                <span>
                                    1 TON = {selectedJetton.rateToTon.toFixed(2)} {selectedJetton.name}
                                </span>
                                <span>1 {selectedJetton.name} = ${selectedJetton.priceUsd.toFixed(5)}</span>
                            </div>
                            <button
                                onClick={
                                    isTonToJetton
                                        ? () =>
                                              handleSwapTon(
                                                  tonConnectUI,
                                                  wallet,
                                                  tonAmount,
                                                  setError,
                                                  setIsLoading,
                                                  factory,
                                                  selectedJetton.address
                                              )
                                        : () =>
                                              handleSwapJetton(
                                                  tonConnectUI,
                                                  wallet,
                                                  jettonAmount,
                                                  setError,
                                                  setIsLoading,
                                                  factory,
                                                  selectedJetton.address
                                              )
                                }
                                disabled={
                                    isLoading ||
                                    !tonConnectUI.connected ||
                                    (!tonAmount && !jettonAmount) ||
                                    isInsufficientBalance()
                                }
                            >
                                {isLoading ? 'Processing...' : 'Swap'}
                            </button>
                        </div>
                    ) : (
                        <div>Initializing...</div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default InTg;