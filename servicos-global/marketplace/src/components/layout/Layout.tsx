import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ExitIntentDrawer } from '../flows/ExitIntentDrawer'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', minWidth: 0 }}>
        {children}
      </main>
      <Footer />
      <ExitIntentDrawer />
    </div>
  )
}
