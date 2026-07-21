import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MarketplaceFundoHero } from './MarketplaceFundoHero'

interface LayoutProps {
  children: React.ReactNode
}

function usaFundoHeroPadrao(pathname: string): boolean {
  if (pathname === '/produtos' || pathname === '/precos' || pathname === '/trial') return true
  if (pathname.startsWith('/produtos/') && pathname !== '/produtos/simulador-comex') return true
  return false
}

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const fundoHero = usaFundoHeroPadrao(pathname)

  useEffect(() => {
    document.body.classList.toggle('marketplace-fundo-hero-body', fundoHero)
    return () => document.body.classList.remove('marketplace-fundo-hero-body')
  }, [fundoHero])

  return (
    <div
      className={fundoHero ? 'marketplace-layout marketplace-layout--fundo-hero' : 'marketplace-layout'}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {fundoHero ? <MarketplaceFundoHero /> : null}
      <Navbar />
      <main style={{ flex: 1, width: '100%', minWidth: 0 }}>{children}</main>
      <Footer />
    </div>
  )
}
