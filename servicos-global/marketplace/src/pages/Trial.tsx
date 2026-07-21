import { useSearchParams } from 'react-router-dom'
import { Package, Sparkle, Truck, Rocket } from '@phosphor-icons/react'
import type { ComponentType, CSSProperties } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import '../styles/trial.css'

interface TrialProduto {
  id: string
  Icon: ComponentType<IconProps>
  name: string
  sub: string
  tag: string
  tagColor: string
  value: string
  note: string
}

const TRIALS: TrialProduto[] = [
  {
    id: 'pedido',
    Icon: Package,
    name: 'Pedido',
    sub: 'Gestão de processos de COMEX',
    tag: 'OPERAÇÕES',
    tagColor: '#8b7bff',
    value: '14 dias',
    note: 'Acesso total ao módulo por 14 dias corridos.',
  },
  {
    id: 'smart-read',
    Icon: Sparkle,
    name: 'Smart Docs',
    sub: 'Inteligência documental com IA',
    tag: 'INTELIGÊNCIA',
    tagColor: '#b6a6ff',
    value: '10 docs / mês',
    note: 'Processe até 10 documentos por mês, sem custo.',
  },
  {
    id: 'bid-frete',
    Icon: Truck,
    name: 'BID Frete',
    sub: 'Licitação de fretes internacionais',
    tag: 'COTAÇÕES',
    tagColor: '#f2a33c',
    value: 'Livre',
    note: 'Uso livre no trial — cote quantas vezes quiser.',
  },
]

const INCLUIDO = [
  'Acesso completo aos módulos que você ativar no trial',
  'Cada produto com sua própria isenção — dias, volume ou uso livre',
  'Suporte via chat durante o período',
  'Dados reais, não mock — seu negócio, agora',
  'Export de dados antes de finalizar, se quiser',
]

const ISENCOES_ATIVAS = [
  { nome: 'Pedido', valor: '14 dias' },
  { nome: 'Smart Docs', valor: '10 docs/mês' },
  { nome: 'BID Frete', valor: 'Livre' },
]

function estiloTag(tagColor: string): CSSProperties {
  return {
    '--tag-color': tagColor,
    '--tag-bg': `${tagColor}1c`,
    '--tag-border': `${tagColor}3a`,
    '--icon-bg': `${tagColor}18`,
    '--icon-border': `${tagColor}30`,
  } as CSSProperties
}

export function Trial() {
  const [searchParams] = useSearchParams()
  const produto = searchParams.get('produto') ?? ''
  const configurador = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'
  const trialUrl = `${configurador}/trial?trial=true${produto ? `&produto=${produto}` : ''}`

  return (
    <section className="trial-page">
      <div className="trial-page__hero">
        <div className="trial-page__kicker">Trial gratuito</div>
        <h1 className="trial-page__titulo">
          Experimente cada produto{' '}
          <span className="trial-page__titulo-destaque">no seu ritmo.</span>
        </h1>
        <p className="trial-page__sub">
          Cada módulo Gravity tem seu próprio trial — comece pelo que faz sentido para a sua operação.
        </p>
      </div>

      <div className="trial-page__conteudo">
        <h2 className="trial-page__secao-titulo">Trial por produto</h2>
        <div className="trial-page__grid-trials">
          {TRIALS.map(t => (
            <article key={t.id} className="trial-card" style={estiloTag(t.tagColor)}>
              <div className="trial-card__topo">
                <span className="trial-card__icone">
                  <t.Icon size={20} weight="duotone" />
                </span>
                <span className="trial-card__badge">{t.tag}</span>
              </div>

              <div className="trial-card__nome">{t.name}</div>
              <div className="trial-card__sub">{t.sub}</div>

              <div className="trial-card__rotulo">Isenção do trial</div>
              <div className="trial-card__valor">{t.value}</div>
              <div className="trial-card__nota">{t.note}</div>
            </article>
          ))}
        </div>

        <div className="trial-page__duas-colunas">
          <div>
            <h2 className="trial-page__bloco-titulo">O que está incluído</h2>
            <div className="trial-page__lista-incluido">
              {INCLUIDO.map(item => (
                <div key={item} className="trial-page__item-incluido">
                  <span className="trial-page__check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h2 className="trial-page__bloco-titulo">Não é necessário</h2>
            <div className="trial-page__lista-nao">
              <div className="trial-page__item-nao">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <rect x="2" y="5" width="16" height="11" rx="2" stroke="#3ddc97" strokeWidth="1.5" />
                  <path d="M2 9h16" stroke="#3ddc97" strokeWidth="1.5" />
                </svg>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="trial-page__item-nao">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M10 2l6 2.5v4.5c0 3.6-2.5 6.7-6 7.8-3.5-1.1-6-4.2-6-7.8V4.5L10 2z"
                    stroke="#3ddc97"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Sem compromisso</span>
              </div>
              <div className="trial-page__item-nao">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="8" stroke="#3ddc97" strokeWidth="1.5" />
                  <path d="M10 6v4l3 2" stroke="#3ddc97" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Cancele a qualquer hora</span>
              </div>
            </div>
          </div>

          <aside className="trial-page__cta-card">
            <div className="trial-page__cta-icone">
              <Rocket size={28} weight="duotone" />
            </div>
            <h2 className="trial-page__cta-titulo">Comece em 60 segundos</h2>
            <p className="trial-page__cta-desc">
              Crie sua conta no Configurador, escolha os produtos e ative o trial de cada um.
            </p>

            <div className="trial-page__isencoes">
              <div className="trial-page__isencoes-rotulo">Isenções ativas</div>
              <div className="trial-page__isencoes-lista">
                {ISENCOES_ATIVAS.map(i => (
                  <div key={i.nome} className="trial-page__isencao-linha">
                    <span>{i.nome}</span>
                    <span>{i.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href={trialUrl} className="trial-page__cta-btn" id="trial-mao-na-massa">
              <Rocket size={18} weight="duotone" />
              Mão na Massa! <span>→</span>
            </a>
            <p className="trial-page__cta-rodape">
              Você será redirecionado para o Configurador para criar sua conta. Sem cartão. Sem burocracia.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
