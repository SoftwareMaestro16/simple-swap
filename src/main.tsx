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
              background: '#ffaa33', 
            },
            accent: '#FFD700', 
            telegramButton: '#FFD700', 
            background: {
              primary: '#ffaa33',
              secondary: '#ffaa33', 
              tint: '#fff238'
            }
          }
        },
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)