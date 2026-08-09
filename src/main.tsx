import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persister, store } from './App/store'

// 1. Import HelmetProvider for async SEO management
import { HelmetProvider } from 'react-helmet-async'

// 2. Import your ThemeProvider
import { ThemeProvider } from './ThemeContext' 
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persister}>
        <HelmetProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)