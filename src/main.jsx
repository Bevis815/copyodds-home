import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import './i18n/i18n'
import './index.css'
import App from './App.jsx'
import { LocaleProvider } from './context/LocaleProvider.jsx'
import i18n from './i18n/i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>,
)
