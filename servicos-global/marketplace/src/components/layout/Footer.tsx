import { Link } from 'react-router-dom'
import { Hexagon, GithubLogo, LinkedinLogo } from '@phosphor-icons/react'
import '../../styles/footer.css'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <div className="footer__logo">
              <Hexagon size={24} weight="duotone" color="var(--accent)" />
              <span className="footer__brand-name">Gravity</span>
            </div>
            <p className="footer__tagline">
              Plataforma SaaS B2B modular. Serviços compartilhados,
              produtos especializados, multi-tenant nativo.
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
            <h4 className="footer__col-title text-micro">Produto</h4>
            <nav>
              <Link to="/produtos" className="footer__link">Catálogo</Link>
              <Link to="/precos" className="footer__link">Preços</Link>
              <Link to="/trial" className="footer__link">Trial Gratuito</Link>
              <Link to="/produtos/simulador-comex" className="footer__link">Simulador Comex</Link>
            </nav>
          </div>

          {/* Links: Empresa */}
          <div className="footer__col">
            <h4 className="footer__col-title text-micro">Empresa</h4>
            <nav>
              <a href="#" className="footer__link">Sobre</a>
              <a href="#" className="footer__link">Blog</a>
              <a href="#" className="footer__link">Carreiras</a>
              <a href="#" className="footer__link">Contato</a>
            </nav>
          </div>

          {/* Links: Legal */}
          <div className="footer__col">
            <h4 className="footer__col-title text-micro">Legal</h4>
            <nav>
              <a href="#" className="footer__link">Termos de Uso</a>
              <a href="#" className="footer__link">Privacidade</a>
              <a href="#" className="footer__link">Cookies</a>
              <a href="#" className="footer__link">LGPD</a>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Gravity. Todos os direitos reservados.
          </p>
          <div className="footer__badges">
            <span className="badge badge-success">Status: Online</span>
            <span className="badge badge-accent">LGPD Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
