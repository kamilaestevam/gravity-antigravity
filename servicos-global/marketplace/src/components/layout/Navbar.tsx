import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  List,
  X,
} from '@phosphor-icons/react'

import '../../styles/navbar.css'
import { LogoGlobal } from '@nucleo/logo-global'
import { useTranslation } from 'react-i18next'


export function Navbar() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: t('marketplace.navbar.produtos'), to: '/produtos' },
    { label: t('marketplace.navbar.precos'), to: '/precos' },
    { label: t('marketplace.navbar.trial'), to: '/trial' },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label={t('marketplace.navbar.aria_home')} style={{ textDecoration: 'none' }}>
          <LogoGlobal iconColor="var(--accent)" />
        </Link>

        {/* Links Desktop */}
        <nav className="navbar__links" aria-label={t('marketplace.navbar.aria_nav')}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__link ${location.pathname.startsWith(link.to) ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs Desktop */}
        <div className="navbar__ctas">
          <Link to="/trial" className="btn btn-secondary btn-sm">
            {t('marketplace.navbar.teste_gratis')}
          </Link>
          <Link to="/checkout" className="btn btn-primary btn-sm">
            {t('marketplace.navbar.comecar_agora')}
          </Link>
        </div>

        {/* Hamburger Mobile */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? t('marketplace.navbar.fechar_menu') : t('marketplace.navbar.abrir_menu')}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="navbar__mobile-menu" role="navigation">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar__mobile-link ${location.pathname.startsWith(link.to) ? 'navbar__mobile-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="navbar__mobile-ctas">
            <Link to="/trial" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('marketplace.navbar.teste_gratis')}
            </Link>
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('marketplace.navbar.comecar_agora')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
