import { Link } from 'react-router-dom'
import { GithubLogo, LinkedinLogo } from '@phosphor-icons/react'
import '../../styles/footer.css'
import { LogoGlobal } from '@nucleo/logo-global'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <LogoGlobal iconSize={24} iconColor="var(--accent)" />
            </div>
            <p className="footer__tagline">
              {t('marketplace.footer.tagline')}
            </p>
            <div className="footer__socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubLogo size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedinLogo size={20} />
              </a>
            </div>
          </div>

          {/* Links: Produto */}
          <div className="footer__col">
            <h4 className="footer__col-title text-micro">{t('marketplace.footer.produto')}</h4>
            <nav>
              <Link to="/produtos" className="footer__link">{t('marketplace.footer.catalogo')}</Link>
              <Link to="/precos" className="footer__link">{t('marketplace.footer.precos')}</Link>
              <Link to="/trial" className="footer__link">{t('marketplace.footer.trial')}</Link>
              <Link to="/produtos/simulador-comex" className="footer__link">{t('marketplace.footer.simulador_comex')}</Link>
            </nav>
          </div>

          {/* Links: Empresa */}
          <div className="footer__col">
            <h4 className="footer__col-title text-micro">{t('marketplace.footer.empresa')}</h4>
            <nav>
              <a href="#" className="footer__link">{t('marketplace.footer.sobre')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.blog')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.carreiras')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.contato')}</a>
            </nav>
          </div>

          {/* Links: Legal */}
          <div className="footer__col">
            <h4 className="footer__col-title text-micro">{t('marketplace.footer.legal')}</h4>
            <nav>
              <a href="#" className="footer__link">{t('marketplace.footer.termos')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.privacidade')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.cookies')}</a>
              <a href="#" className="footer__link">{t('marketplace.footer.lgpd')}</a>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            {t('marketplace.footer.copyright', { year: currentYear })}
          </p>
          <div className="footer__badges">
            <span className="badge badge-success">{t('marketplace.footer.status_online')}</span>
            <span className="badge badge-accent">{t('marketplace.footer.lgpd_compliant')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
