import styles from "./style.module.scss";
import QRCode from 'react-qr-code';

function NoTg() {

    return (
        <>
            <div className={styles.notContainer}>
                <h1>Please, open in Telegram.</h1>
                <QRCode className={styles.QR} value="https://t.me/SwapSCBot/Swap" bgColor="#0d0c0c" fgColor="#ffffff" size={185} />
            </div>
        </>
    );
}

export default NoTg;