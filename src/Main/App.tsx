import { useState, useEffect } from 'react';
import styles from './style.module.scss';
import WebApp from '@twa-dev/sdk';
import NoTg from '../NoTg/NoTg';
import InTg from '../InTg/InTg';

declare global {
  interface Window {
    Telegram?: any;
  }
}

function App() {
  const [isTelegram, setIsTelegram] = useState<boolean>(false);

  useEffect(() => {
    const isTgCheck = typeof window !== 'undefined' && window.Telegram?.WebApp?.initData;

    if (isTgCheck) {
      WebApp.ready();
      WebApp.enableClosingConfirmation();
      WebApp.expand();
      WebApp.setHeaderColor('#111111');

      if (isTgCheck.innerWidth <= 600) {
        WebApp.requestFullscreen();
      }
      
      setIsTelegram(true);

      document.body.style.backgroundColor = '#1a1a1e';
    }
  }, []);
  
  return (
    <div className={styles.appContainer}>
      {isTelegram ? <InTg /> : <NoTg />}
    </div>
  );
}

export default App;