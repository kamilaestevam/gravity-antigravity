import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

export type PainelDashboardSimulador = {
  id: string
  nome: string
}

const PAINEIS_PADRAO: PainelDashboardSimulador[] = [
  { id: 'padrao', nome: 'Padrão' },
  { id: 'comercial', nome: 'COMERCIAL' },
  { id: 'financeiro', nome: 'FINANCEIRO' },
]

export interface FaixaPaineisDashboardSimuladorPedidoProps {
  painelAtualId: string
  onTrocarPainel: (id: string) => void
  onCriandoPainelChange?: (criando: boolean) => void
}

export function FaixaPaineisDashboardSimuladorPedido({
  painelAtualId,
  onTrocarPainel,
  onCriandoPainelChange,
}: FaixaPaineisDashboardSimuladorPedidoProps) {
  const { t } = useTranslation()
  const [paineis, setPaineis] = useState<PainelDashboardSimulador[]>(PAINEIS_PADRAO)
  const [criando, setCriando] = useState(false)
  const [nomeNovo, setNomeNovo] = useState('')

  useEffect(() => {
    onCriandoPainelChange?.(criando)
  }, [criando, onCriandoPainelChange])

  function confirmarNovoPainel() {
    const nome = nomeNovo.trim()
    if (!nome) {
      setCriando(false)
      return
    }
    const id = `painel_${Date.now()}`
    setPaineis(prev => [...prev, { id, nome }])
    onTrocarPainel(id)
    setNomeNovo('')
    setCriando(false)
  }

  return (
    <nav
      className="lp-faixa-navegacao"
      aria-label={t('pedido.dashboard.faixa_paineis', { defaultValue: 'Painéis do dashboard' })}
      data-testid="dashboard-faixa-paineis-simulador"
      data-sds-tutorial-alvo="pedido-dashboard-faixa-paineis"
    >
      <section
        className="lp-faixa-navegacao__paineis"
        aria-label={t('pedido.dashboard.paineis_secao', { defaultValue: 'Painéis do dashboard' })}
      >
        <div
          className="lp-paineis-lista-strip lp-paineis-lista-strip--unificado"
          data-testid="dashboard-painel-bar"
        >
          <span
            className="lp-paineis-lista-strip__label"
            title={t('pedido.dashboard.paineis_secao', { defaultValue: 'Painéis do dashboard' })}
          >
            {t('pedido.dashboard.paineis_secao_curto', { defaultValue: 'Painéis' })}
          </span>

          <div className="lp-paineis-lista-strip__tabs pedido-dashboard-painel-bar">
            {paineis.map(painel => {
              const ativo = painelAtualId === painel.id
              return (
                <div
                  key={painel.id}
                  className={[
                    'lp-painel-tab-cluster',
                    ativo ? 'lp-painel-tab-cluster--ativo' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    data-testid={ativo ? 'dashboard-painel-atual' : `painel-tab-${painel.id}`}
                    className="lp-painel-tab lp-painel-tab--rotulo"
                    onClick={() => onTrocarPainel(painel.id)}
                    aria-current={ativo ? 'true' : undefined}
                    aria-label={painel.nome}
                    {...(painel.id === 'comercial' ? { 'data-sds-tutorial-alvo': 'pedido-dashboard-painel-comercial' } : {})}
                    {...(painel.id === 'padrao' ? { 'data-sds-tutorial-alvo': 'pedido-dashboard-painel-padrao' } : {})}
                    {...(painel.id === 'financeiro' ? { 'data-sds-tutorial-alvo': 'pedido-dashboard-painel-financeiro' } : {})}
                  >
                    <span className="lp-painel-tab__nome">{painel.nome}</span>
                  </button>
                </div>
              )
            })}

            {criando ? (
              <form
                className="lp-painel-tab-form"
                data-sds-tutorial-alvo="pedido-dashboard-painel-nome"
                onSubmit={e => {
                  e.preventDefault()
                  confirmarNovoPainel()
                }}
              >
                <input
                  type="text"
                  placeholder={t('pedido.dashboard.novo_painel_placeholder', { defaultValue: 'Nome do painel' })}
                  value={nomeNovo}
                  onChange={e => setNomeNovo(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setCriando(false)
                  }}
                  autoFocus
                  maxLength={60}
                />
                <button
                  type="submit"
                  className="lp-painel-tab-form__ok"
                  aria-label={t('comum.salvar', { defaultValue: 'Salvar' })}
                  data-sds-tutorial-alvo="pedido-dashboard-painel-nome-salvar"
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="lp-painel-tab-form__cancel"
                  onClick={() => { setCriando(false); setNomeNovo('') }}
                  aria-label={t('comum.cancelar', { defaultValue: 'Cancelar' })}
                  data-sds-tutorial-alvo="pedido-dashboard-painel-nome-cancelar"
                >
                  <X size={11} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="lp-painel-tab-add"
                data-testid="dashboard-painel-criar"
                data-sds-tutorial-alvo="pedido-dashboard-painel-criar"
                aria-label={t('pedido.dashboard.adicionar_painel', { defaultValue: 'Adicionar painel' })}
                title={t('pedido.dashboard.adicionar_painel', { defaultValue: 'Adicionar painel' })}
                onClick={() => setCriando(true)}
              >
                +
              </button>
            )}
          </div>
        </div>
      </section>
    </nav>
  )
}
