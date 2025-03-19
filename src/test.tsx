import { useState, useEffect } from 'react';
import { Factory, Asset, PoolType, ReadinessStatus, } from '@dedust/sdk';
import { Address, TonClient4, toNano, beginCell,} from '@ton/ton';
import { toUserFriendlyAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { getJettonWalletAddress } from './tonapi';

const SIMPLE_COIN_ADDRESS = 'EQB9QBqniFI0jOmw3PU6v1v4LU3Sivm9yPXDDB9Qf7cXTDft';

function App() {
    const [tonConnectUI] = useTonConnectUI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const wallet = useTonWallet();
    
    const tonClient = new TonClient4({ endpoint: 'https://mainnet-v4.tonhubapi.com' });
    const factoryAddress = Address.parse('EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67');
    const factory = tonClient.open(Factory.createFromAddress(factoryAddress));
    
    const SC_ADDRESS = Address.parse('EQB9QBqniFI0jOmw3PU6v1v4LU3Sivm9yPXDDB9Qf7cXTDft');
    const TON = Asset.native();
    const SC = Asset.jetton(SC_ADDRESS);

    useEffect(() => {
        const checkPoolAndVault = async () => {
            try {
                setIsLoading(true);
                
                const tonVault = tonClient.open(await factory.getNativeVault());
                const pool = tonClient.open(await factory.getPool(PoolType.VOLATILE, [TON, SC]));
       
                if ((await pool.getReadinessStatus()) !== ReadinessStatus.READY) {
                    throw new Error('Пул TON/SCALE не существует');
                }
                
                if ((await tonVault.getReadinessStatus()) !== ReadinessStatus.READY) {
                    throw new Error('TON Vault не существует');
                }

                setIsReady(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Неизвестная ошибка при инициализации');
            } finally {
                setIsLoading(false);
            }
        };

        checkPoolAndVault();
    }, []);

    const handleSwapTon = async () => {
        if (!tonConnectUI.connected || !wallet) {
            setError('Сначала подключите кошелек');
            return;
        }

        console.log(wallet.account.address);

        try {
            setIsLoading(true);
            setError(null);

            const tonVault = tonClient.open(await factory.getNativeVault());
            const pool = tonClient.open(await factory.getPool(PoolType.VOLATILE, [TON, SC]));

            const amountIn = toNano('0.02');
            const gasAmount = toNano('0.1705'); 


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
                    .storeAddress((Address.parse(toUserFriendlyAddress(wallet.account.address))))
                    .storeAddress((Address.parse(toUserFriendlyAddress(wallet.account.address))))
                    .storeMaybeRef(null)
                    .storeMaybeRef(null)
                  .endCell()
                )
                .endCell();

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: tonVault.address.toString(),
                        amount: (amountIn + gasAmount).toString(), 
                        payload: swapPayload.toBoc().toString('base64')
                    }
                ]
            };

            await tonConnectUI.sendTransaction(transaction);
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwapJetton = async () => {
      if (!tonConnectUI.connected || !wallet) {
          setError('Сначала подключите кошелек');
          return;
      }
  
      console.log(wallet.account.address);
      const jwAddress = await getJettonWalletAddress(Address.parse(SIMPLE_COIN_ADDRESS).toRawString(), wallet!.account.address)
  
      try {
          setIsLoading(true);
          setError(null);
  
          const jettonVault = tonClient.open(await factory.getJettonVault(SC_ADDRESS));
          const pool = tonClient.open(await factory.getPool(PoolType.VOLATILE, [TON, SC]));
  
          const amountIn = toNano('100');
          const gasAmount = toNano('0.175'); 
  
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
              messages: [
                  {
                      address: jwAddress.toString(),
                      amount: toNano('0.21').toString(),
                      payload: swapPayload.toBoc().toString('base64')
                  }
              ]
          };
  
          await tonConnectUI.sendTransaction(transaction);
          
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Ошибка при выполнении свопа');
      } finally {
          setIsLoading(false);
      }
  };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Swap TON & SC</h2>
            <TonConnectButton />
            <div style={{ marginTop: '20px' }}>
                {!isReady && <p>Проверка готовности пула и вольта...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {isReady && (
                  <>
                  <button
                        onClick={handleSwapTon}
                        disabled={isLoading || !tonConnectUI.connected}
                        style={{ padding: '10px 20px' }}
                    >
                        {isLoading ? 'Выполняется...' : 'Swap TON -> SC'}
                    </button>
                    <button
                        onClick={handleSwapJetton}
                        disabled={isLoading || !tonConnectUI.connected}
                        style={{ padding: '10px 20px' }}
                    >
                        {isLoading ? 'Выполняется...' : 'Swap SC -> TON'}
                    </button>
                    <h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1><h1>2</h1>
                  </>
                    
                
                )}
            </div>
        </div>
    );
}

export default App;