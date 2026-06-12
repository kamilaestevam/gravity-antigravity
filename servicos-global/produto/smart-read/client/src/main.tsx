import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<{ publishableKey: string; children: React.ReactNode }> | null>(null)
  useEffect(() => {
    if (!CLERK_KEY) return
    import('@clerk/clerk-react')
      .then(mod => setProvider(() => mod.ClerkProvider))
      .catch(() => {})
  }, [])
  if (!CLERK_KEY || !Provider) return <>{children}</>
  return <Provider publishableKey={CLERK_KEY}>{children}</Provider>
}

const raiz = document.getElementById('root')
if (!raiz) throw new Error('Elemento #root nao encontrado')

ReactDOM.createRoot(raiz).render(
  <React.StrictMode>
    <ClerkWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkWrapper>
  </React.StrictMode>,
)
