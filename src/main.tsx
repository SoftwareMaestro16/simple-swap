import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Main/App.tsx'
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider 
      manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
      uiPreferences={{
        colorsSet: {
          [THEME.DARK]: {
            connectButton: {
              background: '#141414',
            },
            accent: '#4a4a4a',
            telegramButton: '#1a1a1a',
            background: {
              primary: '#0d0d0d',
              secondary: '#1a1a1a',
              tint: '#2b2b2b'
            }
          },
          [THEME.LIGHT]: { 
            connectButton: {
              background: '#FFD700', 
            },
            accent: '#FFC107', 
            telegramButton: '#FFEB3B', 
            background: {
              primary: '#FFF9C4',
              secondary: '#FFECB3', 
              tint: '#FFE082' 
            }
          }
        },
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)