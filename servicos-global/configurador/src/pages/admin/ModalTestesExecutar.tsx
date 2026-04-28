/**
 * ModalExecutarTestes
 * --------------------
 * Modal standalone disparado pelo botão "Rodar todos os testes" da tela de Log de Testes.
 * Permite ao usuário escolher produto/ambiente, selecionar planos específicos e disparar a execução.
 *
 * Historicamente esse conteúdo era uma aba ("Execução Manual") dentro do ModalAgendamentoTestes,
 * mas foi extraído para não poluir o modal de agendamento (que só cuida de configurar cron/alertas).
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { Play, CheckSquare, Square, Flask } from '@phosphor-icons/react'
import { adminTestesApi, type TestePlanoApi } from '../../services/apiClient'

export interface ModalExecutarTestesProps {
  aberto: boolean
  aoFechar: () => void
  /** Notifica o pai para iniciar o polling de status após o disparo. */
  aoIniciarRun?: (planos: string[]) => void
}

const PRODUTOS = [
  { valor: 'configurador', rotulo: 'Configurador' },
  { valor: 'pedido',       rotulo: 'Pedido' },
  { valor: 'bid-frete',    rotulo: 'Bid Frete' },
  { valor: 'bid-cambio',   rotulo: 'Bid Câmbio' },
  { valor: 'lpco',         rotulo: 'LPCO' },
  { valor: 'nf-importacao',rotulo: 'NF Importação' },
  { valor: 'simula-custo', rotulo: 'SimulaCusto' },
]

const opcoesAmbiente = [
  { valor: 'Local',    rotulo: 'Local' },
  { valor: 'Staging',  rotulo: 'Staging' },
  { valor: 'Producao', rotulo: 'Produção' },
]

export function ModalExecutarTestes({ aberto, aoFechar, aoIniciarRun }: ModalExecutarTestesProps) {
  const { t } = useTranslation()
  const [dadosManual, setDadosManual] = useState({
    produto: 'configurador',
    ambiente: 'Local',
  })

  const [planosDisponiveis, setPlanosDisponiveis] = useState<TestePlanoApi[]>([])
  const [planosSelecionados, setPlanosSelecionados] = useState<Set<string>>(new Set())
  const [carregandoPlanos, setCarregandoPlanos] = useState(false)
  const [rodando, setRodando] = useState(false)

  // Carrega planos quando o produto muda (ou quando o modal abre)
  useEffect(() => {
    if (!aberto) return
    setCarregandoPlanos(true)
    adminTestesApi.listPlans(dadosManual.produto)
      .then(res => {
        setPlanosDisponiveis(res.plans)
        setPlanosSelecionados(new Set(res.plans.map(p => p.id)))
      })
      .catch(() => setPlanosDisponiveis([]))
      .finally(() => setCarregandoPlanos(false))
  }, [dadosManual.produto, aberto])

  function togglePlano(id: string) {
    setPlanosSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleExecutar() {
    if (planosSelecionados.size === 0) return
    setRodando(true)
    try {
      await adminTestesApi.runTests({ planos: Array.from(planosSelecionados) })
      if (aoIniciarRun) aoIniciarRun(Array.from(planosSelecionados))
      aoFechar()
    } catch {
      // erro silencioso — o run já iniciou
    } finally {
      setRodando(false)
    }
  }

  const abas: AbaFormulario[] = [
    {
      id: 'executar',
      rotulo: 'Executar',
      ocultarBotoesSalvar: true, // tem botão de ação próprio ("Executar N plano(s)")
      conteudo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', height: '100%', minHeight: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.1em' }}>
            <Play size={14} weight="fill" /> Disparo Manual por Plano
          </h4>

          {/* Seletor de Produto + Ambiente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <CampoGeralGlobal label="Produto / Local">
              <SelectGlobal
                opcoes={PRODUTOS}
                valor={dadosManual.produto}
                aoMudarValor={v => setDadosManual({ ...dadosManual, produto: String(v) })}
              />
            </CampoGeralGlobal>
            <CampoGeralGlobal label={t('admin.testes-gerais.agendamento.campo_ambiente_origem')}>
              <SelectGlobal
                opcoes={opcoesAmbiente}
                valor={dadosManual.ambiente}
                aoMudarValor={v => setDadosManual({ ...dadosManual, ambiente: String(v) })}
              />
            </CampoGeralGlobal>
          </div>

          {/* Lista de Planos — flex:1 absorve altura restante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flask size={13} weight="fill" />
                Planos disponíveis — {PRODUTOS.find(p => p.valor === dadosManual.produto)?.rotulo ?? dadosManual.produto}
              </span>
              {planosDisponiveis.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (planosSelecionados.size === planosDisponiveis.length) {
                      setPlanosSelecionados(new Set())
                    } else {
                      setPlanosSelecionados(new Set(planosDisponiveis.map(p => p.id)))
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {planosSelecionados.size === planosDisponiveis.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              )}
            </div>

            {carregandoPlanos ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Carregando planos...
              </div>
            ) : planosDisponiveis.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem',
                border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                Nenhum plano de teste cadastrado para este produto.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {planosDisponiveis.map(plano => {
                  const selecionado = planosSelecionados.has(plano.id)
                  return (
                    <div
                      key={plano.id}
                      onClick={() => togglePlano(plano.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer',
                        background: selecionado ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.3)',
                        border: `1px solid ${selecionado ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ marginTop: '1px', flexShrink: 0, color: selecionado ? '#818cf8' : '#475569' }}>
                        {selecionado
                          ? <CheckSquare size={18} weight="fill" />
                          : <Square size={18} />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em',
                            padding: '2px 6px', borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}>
                            {plano.id}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>
                            {plano.name}
                          </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                          {plano.description}
                        </p>
                        <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {plano.steps.slice(0, 4).map((step, i) => (
                            <span key={i} style={{
                              fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                              color: '#94a3b8',
                            }}>
                              {step}
                            </span>
                          ))}
                          {plano.steps.length > 4 && (
                            <span style={{ fontSize: '0.65rem', color: '#475569' }}>
                              +{plano.steps.length - 4} passos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botão Executar — ancorado no rodapé do container */}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', flexShrink: 0 }}>
            <button
              type="button"
              disabled={planosSelecionados.size === 0 || rodando}
              onClick={handleExecutar}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 2rem', borderRadius: '12px',
                background: planosSelecionados.size === 0 || rodando
                  ? 'rgba(16,185,129,0.3)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700, border: 'none',
                cursor: planosSelecionados.size === 0 || rodando ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)',
                width: 'max-content', transition: 'transform 0.2s',
                opacity: planosSelecionados.size === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!rodando && planosSelecionados.size > 0) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Play size={20} weight="fill" />
              {rodando
                ? 'Iniciando...'
                : `Executar ${planosSelecionados.size} plano${planosSelecionados.size !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      )
    }
  ]

  return (
    <ModalFormularioAbasGlobal
      aberto={aberto}
      aoFechar={aoFechar}
      aoSalvar={() => { /* no-op — aba é de ação, botão próprio */ }}
      icone={<Play weight="fill" size={24} color="#10b981" />}
      titulo="Rodar Testes"
      subtitulo="Selecione o produto, o ambiente e os planos de teste a serem executados"
      tamanho="lg"
      altura="720px"
      abas={abas}
      semAbas={true}
    />
  )
}
