/**
 * ModalExecutarTestes
 * --------------------
 * Modal standalone disparado pelo botão "Rodar todos os testes" da tela de Log de Testes.
 * Permite ao usuário escolher produto/ambiente, selecionar planos específicos e disparar a execução.
 *
 * Historicamente esse conteúdo era uma aba ("Execução Manual") dentro do ModalAgendamentoTestes,
 * mas foi extraído para não poluir o modal de agendamento (que só cuida de configurar cron/alertas).
 *
 * Mapeamento Produto → Escopo (Prisma TestePlano.escopo_plano_teste):
 *   admin           → ADMIN
 *   configurador    → CONFIG
 *   pedido          → PEDIDO
 *   bid-frete       → BIDFRT
 *   bid-cambio      → BIDCAM
 *   lpco            → LPCO
 *   nf-importacao   → NFIMP
 *   simula-custo    → SIMCUS
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalFormularioAbasGlobal, type AbaFormulario } from '@nucleo/modal-formulario-abas-global'
import { SelectGlobal } from '@nucleo/campo-select-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { Play, CheckSquare, Square, Flask, Funnel } from '@phosphor-icons/react'
import { adminPlanosTesteApi, adminTestesApi, type PlanoTesteApi } from '../../services/apiClient'

export interface ModalExecutarTestesProps {
  aberto: boolean
  aoFechar: () => void
  /** Notifica o pai para iniciar o polling de status após o disparo. */
  aoIniciarRun?: (planos: string[]) => void
}

/** Produto/Local — primeira opção é Admin (singleton do Gravity HQ). */
const PRODUTOS = [
  { valor: 'admin',         rotulo: 'Admin' },
  { valor: 'configurador',  rotulo: 'Configurador' },
  { valor: 'pedido',        rotulo: 'Pedido' },
  { valor: 'bid-frete',     rotulo: 'Bid Frete' },
  { valor: 'bid-cambio',    rotulo: 'Bid Câmbio' },
  { valor: 'lpco',          rotulo: 'LPCO' },
  { valor: 'nf-importacao', rotulo: 'NF Importação' },
  { valor: 'simula-custo',  rotulo: 'SimulaCusto' },
]

/** Mapeamento produto → TestePlano.escopo_plano_teste (campo Prisma). */
const PRODUTO_PARA_ESCOPO: Record<string, string> = {
  'admin':          'ADMIN',
  'configurador':   'CONFIG',
  'pedido':         'PEDIDO',
  'bid-frete':      'BIDFRT',
  'bid-cambio':     'BIDCAM',
  'lpco':           'LPCO',
  'nf-importacao':  'NFIMP',
  'simula-custo':   'SIMCUS',
}

const opcoesAmbiente = [
  { valor: 'Local',    rotulo: 'Local' },
  { valor: 'Staging',  rotulo: 'Staging' },
  { valor: 'Producao', rotulo: 'Produção' },
]

/** Tipos de teste (TestePlano.tipo_plano_teste). CRO = cross-organização. */
type TipoTeste = 'UNI' | 'FUN' | 'E2E' | 'CRO'
const TIPOS_TESTE: Array<{ valor: TipoTeste; rotulo: string; descricao: string }> = [
  { valor: 'UNI', rotulo: 'Unitário',     descricao: 'Vitest — função/hook isolado' },
  { valor: 'FUN', rotulo: 'Funcional',    descricao: 'Vitest+Supertest — rota/fluxo HTTP' },
  { valor: 'E2E', rotulo: 'End-to-End',   descricao: 'Playwright — fluxo no navegador' },
  { valor: 'CRO', rotulo: 'Cross-Org',    descricao: 'Isolamento entre organizações' },
]

export function ModalExecutarTestes({ aberto, aoFechar, aoIniciarRun }: ModalExecutarTestesProps) {
  const { t } = useTranslation()
  const [dadosManual, setDadosManual] = useState({
    produto: 'admin',
    ambiente: 'Local',
  })

  /** Tipos de teste selecionados (filtro). Default: todos os 4 ativos. */
  const [tiposAtivos, setTiposAtivos] = useState<Set<TipoTeste>>(
    new Set<TipoTeste>(['UNI', 'FUN', 'E2E', 'CRO'])
  )

  const [planosDisponiveis, setPlanosDisponiveis] = useState<PlanoTesteApi[]>([])
  const [planosSelecionados, setPlanosSelecionados] = useState<Set<string>>(new Set())
  const [carregandoPlanos, setCarregandoPlanos] = useState(false)
  const [rodando, setRodando] = useState(false)

  // Carrega planos quando o produto muda (ou quando o modal abre)
  useEffect(() => {
    if (!aberto) return
    setCarregandoPlanos(true)
    const escopo = PRODUTO_PARA_ESCOPO[dadosManual.produto]
    adminPlanosTesteApi.listar(escopo)
      .then(res => {
        setPlanosDisponiveis(res.planos)
        setPlanosSelecionados(new Set(res.planos.map(p => p.id)))
      })
      .catch(() => setPlanosDisponiveis([]))
      .finally(() => setCarregandoPlanos(false))
  }, [dadosManual.produto, aberto])

  /** Filtra os planos pelos tipos ativos no momento. */
  const planosFiltrados = planosDisponiveis.filter(p => tiposAtivos.has(p.tipo as TipoTeste))

  function togglePlano(id: string) {
    setPlanosSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTipo(tipo: TipoTeste) {
    setTiposAtivos(prev => {
      const next = new Set(prev)
      if (next.has(tipo)) next.delete(tipo)
      else next.add(tipo)
      return next
    })
  }

  async function handleExecutar() {
    if (planosSelecionados.size === 0) return
    setRodando(true)
    try {
      // Só dispara os planos que estão selecionados E que passam no filtro de tipo
      const idsAExecutar = Array.from(planosSelecionados).filter(id =>
        planosFiltrados.some(p => p.id === id)
      )
      await adminTestesApi.disparar({ planos: idsAExecutar })
      if (aoIniciarRun) aoIniciarRun(idsAExecutar)
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

          {/* Filtro por tipo de teste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Funnel size={13} weight="fill" />
              Tipos de Teste Ativos (Filtro)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TIPOS_TESTE.map(tipo => {
                const ativo = tiposAtivos.has(tipo.valor)
                return (
                  <button
                    key={tipo.valor}
                    type="button"
                    onClick={() => toggleTipo(tipo.valor)}
                    title={tipo.descricao}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.75rem', borderRadius: '8px',
                      background: ativo ? 'rgba(167, 139, 250, 0.12)' : 'rgba(15, 23, 42, 0.4)',
                      border: `1px solid ${ativo ? 'rgba(167, 139, 250, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: ativo ? '#c4b5fd' : '#64748b',
                      fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {ativo ? <CheckSquare size={14} weight="fill" /> : <Square size={14} />}
                    <span style={{ letterSpacing: '0.05em' }}>{tipo.valor}</span>
                    <span style={{ fontWeight: 500, opacity: 0.85 }}>· {tipo.rotulo}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista de Planos — flex:1 absorve altura restante */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flask size={13} weight="fill" />
                Planos disponíveis — {PRODUTOS.find(p => p.valor === dadosManual.produto)?.rotulo ?? dadosManual.produto}
                {planosDisponiveis.length > 0 && (
                  <span style={{ fontWeight: 500, color: '#64748b' }}>
                    · {planosFiltrados.length}/{planosDisponiveis.length} após filtro
                  </span>
                )}
              </span>
              {planosFiltrados.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const idsFiltrados = planosFiltrados.map(p => p.id)
                    const todosSelecionados = idsFiltrados.every(id => planosSelecionados.has(id))
                    if (todosSelecionados) {
                      const next = new Set(planosSelecionados)
                      idsFiltrados.forEach(id => next.delete(id))
                      setPlanosSelecionados(next)
                    } else {
                      setPlanosSelecionados(new Set([...planosSelecionados, ...idsFiltrados]))
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {planosFiltrados.every(p => planosSelecionados.has(p.id)) ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              )}
            </div>

            {carregandoPlanos ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Carregando planos...
              </div>
            ) : planosFiltrados.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem',
                border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                {planosDisponiveis.length === 0
                  ? 'Nenhum plano de teste cadastrado para este produto.'
                  : `Nenhum plano cadastrado para os tipos selecionados (${planosDisponiveis.length} ocultados pelo filtro).`}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {planosFiltrados.map(plano => {
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.06em',
                            padding: '2px 5px', borderRadius: '3px',
                            background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                          }}>
                            {plano.tipo}
                          </span>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em',
                            padding: '2px 6px', borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}>
                            {plano.id}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>
                            {plano.tela ?? plano.modulo ?? plano.sublocal}
                          </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                          {plano.sublocal}
                          {plano.criticidade && ` · criticidade ${plano.criticidade}`}
                          {typeof plano.passosTotal === 'number' && ` · ${plano.passosTotal} passos`}
                          {typeof plano.casosTotal === 'number' && ` · ${plano.casosTotal} casos`}
                        </p>
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
