import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { FavoritesProvider } from './contexts/FavoritesContext.tsx'
import { EventsProvider } from './contexts/EventsContext.tsx'
import { NotificationsProvider } from './contexts/NotificationsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <EventsProvider>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </EventsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
