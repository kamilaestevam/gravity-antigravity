import React, { useEffect, useMemo, useState } from 'react'
import { Camera, CaretDown, Crosshair, Eye, ListChecks, Flask, FileText, Globe } from '@phosphor-icons/react'
import { ModalOverlay } from '@nucleo/modal-global'
import {
  adminPlanosTesteApi,
  type PlanoTesteApi,
  type CasoPlanoTesteApi,
  type AmbienteExecucaoApi,
} from '../../services/api-client'

export interface ModalDetalhePlanoTesteProps {
  aberto: boolean
  plano: PlanoTesteApi | null
  ambiente: 'Local' | 'Staging' | 'Producao'
  aoFechar: () => void
}

type ParteDetalhePasso = { tipo: 'texto' | 'print'; valor: string }

/** Detecta referências de print no roteiro EMT (`Print \`arquivo.png\``, legado `→ print \`06\``). */
function segmentarDetalheComPrints(detalhe: string): ParteDetalhePasso[] {
  const re = /(?:·\s*)?Print\s+`([^`]+)`(?:\s*\(sucesso ou erro\))?|(?:→\s*)?print\s+`([^`]+)`|→\s*`(\d{2}(?:-[\w-]+)*(?:\.png)?)`/gi
  const partes: ParteDetalhePasso[] = []
  let ultimo = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(detalhe)) !== null) {
    if (match.index > ultimo) {
      partes.push({ tipo: 'texto', valor: detalhe.slice(ultimo, match.index) })
    }
    const arquivo = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (arquivo) partes.push({ tipo: 'print', valor: arquivo })
    ultimo = match.index + match[0].length
  }

  if (ultimo < detalhe.length) {
    partes.push({ tipo: 'texto', valor: detalhe.slice(ultimo) })
  }
  if (partes.length === 0) {
    partes.push({ tipo: 'texto', valor: detalhe })
  }
  return partes
}

function BadgePrintEmt({ arquivo }: { arquivo: string }) {
  const nome = /\.png$/i.test(arquivo) ? arquivo : `${arquivo}.png`
  return (
    <span
      title="Screenshot capturado ao final do passo (sucesso ou erro)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        margin: '0 0.15rem',
        padding: '0.12rem 0.45rem',
        borderRadius: '5px',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        color: '#fcd34d',
        fontSize: '0.68rem',
        fontFamily: 'ui-monospace, monospace',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        opacity: 0.65,
      }}
    >
      <Camera size={12} weight="fill" aria-hidden />
      <span>{nome}</span>
      <span style={{ opacity: 0.72, fontSize: '0.6rem', fontFamily: 'inherit' }}>(sucesso ou erro)</span>
    </span>
  )
}

function DetalhePassoComPrints({ detalhe }: { detalhe: string }) {
  const partes = segmentarDetalheComPrints(detalhe)
  return (
    <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.55 }}>
      {partes.map((p, i) => (
        p.tipo === 'print'
          ? <BadgePrintEmt key={`print-${i}-${p.valor}`} arquivo={p.valor} />
          : <span key={`txt-${i}`}>{p.valor}</span>
      ))}
    </span>
  )
}

const estiloLinhaCaso = {
  display: 'grid',
  gridTemplateColumns: '48px 1fr auto',
  gap: '0.75rem',
  alignItems: 'center',
  padding: '0.625rem 0.75rem',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.4)',
  border: '1px solid rgba(255,255,255,0.06)',
} as const

function BotaoVisualizarPasso({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Visualizar passo completo"
      aria-label="Visualizar passo completo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'transparent',
        color: '#94a3b8',
        cursor: 'pointer',
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <Eye size={16} weight="regular" />
    </button>
  )
}

function SecaoPassoPlano({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{
        fontSize: '0.65rem', fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem',
      }}>
        {rotulo}
      </div>
      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.55 }}>
        {children}
      </div>
    </div>
  )
}

function ModalPassoPlanoTeste({
  caso,
  aoFechar,
}: {
  caso: CasoPlanoTesteApi
  aoFechar: () => void
}) {
  const temEstrutura = Boolean(caso.acao || caso.aprovadoQuando)

  return (
    <ModalOverlay
      aberto
      aoFechar={aoFechar}
      tamanho="md"
      titulo={`Passo ${caso.ordem}`}
      renderizarFooter={() => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
          <button
            type="button"
            onClick={aoFechar}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '8px',
              background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      )}
    >
      <div style={{ padding: '0 1.5rem 1.25rem' }}>
        {caso.titulo && (
          <SecaoPassoPlano rotulo="Etapa">
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>{caso.titulo}</span>
          </SecaoPassoPlano>
        )}
        {temEstrutura ? (
          <>
            {caso.acao && (
              <SecaoPassoPlano rotulo="Ação">
                <DetalhePassoComPrints detalhe={caso.acao} />
              </SecaoPassoPlano>
            )}
            {caso.aprovadoQuando && (
              <SecaoPassoPlano rotulo="APROVADO quando">
                <DetalhePassoComPrints detalhe={caso.aprovadoQuando} />
              </SecaoPassoPlano>
            )}
          </>
        ) : (
          <SecaoPassoPlano rotulo="Detalhe">
            <DetalhePassoComPrints detalhe={caso.detalhe} />
          </SecaoPassoPlano>
        )}
      </div>
    </ModalOverlay>
  )
}

function LinhaCaso({
  ordem,
  detalhe,
  onVisualizar,
}: {
  ordem: string
  detalhe: string
  onVisualizar: () => void
}) {
  return (
    <div style={estiloLinhaCaso}>
      <span style={{
        fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {ordem}
      </span>
      <DetalhePassoComPrints detalhe={detalhe} />
      <BotaoVisualizarPasso onClick={onVisualizar} />
    </div>
  )
}

function BlocoColapsavel({
  titulo,
  contagem,
  colapsado,
  onToggle,
  rotuloContagem,
  children,
}: {
  titulo: string
  contagem: number
  colapsado: boolean
  onToggle: () => void
  /** Ex.: "passo(s)" ou "print(s)" — padrão passos */
  rotuloContagem?: string
  children: React.ReactNode
}) {
  const suffix = rotuloContagem ?? (contagem !== 1 ? 'passos' : 'passo')
  return (
    <div style={{
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(15, 23, 42, 0.25)',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!colapsado}
        title={colapsado ? 'Expandir' : 'Recolher'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.55rem 0.75rem',
          border: 'none',
          background: 'transparent',
          color: '#a78bfa',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <CaretDown
          size={14}
          weight="bold"
          style={{
            flexShrink: 0,
            transition: 'transform 0.15s ease',
            transform: colapsado ? 'rotate(-90deg)' : 'rotate(0deg)',
          }}
          aria-hidden
        />
        <span style={{
          flex: 1,
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.35,
        }}>
          {titulo}
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          color: '#64748b',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}>
          {contagem} {suffix}
        </span>
      </button>
      {!colapsado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0 0.5rem 0.5rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function LinhaPrintPlanejado({
  caso,
  onVisualizar,
}: {
  caso: CasoPlanoTesteApi
  onVisualizar: () => void
}) {
  return (
    <div style={estiloLinhaCaso}>
      <span style={{
        fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {caso.ordem}
      </span>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
        <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.4rem', flexWrap: 'wrap', opacity: 0.65 }}>
          <Camera size={14} weight="fill" color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
          <span>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{caso.titulo}</span>
            {' — '}
            {caso.detalhe}
          </span>
        </span>
      </div>
      <BotaoVisualizarPasso onClick={onVisualizar} />
    </div>
  )
}

function ListaPrintsPlanejados({
  itens,
  onVisualizarPasso,
}: {
  itens: CasoPlanoTesteApi[]
  onVisualizarPasso: (caso: CasoPlanoTesteApi) => void
}) {
  const [colapsado, setColapsado] = useState(true)

  useEffect(() => {
    setColapsado(true)
  }, [itens])

  return (
    <BlocoColapsavel
      titulo="PRINTS PLANEJADOS"
      contagem={itens.length}
      colapsado={colapsado}
      onToggle={() => setColapsado(c => !c)}
      rotuloContagem={itens.length !== 1 ? 'prints' : 'print'}
    >
      {itens.map((caso, idx) => (
        <LinhaPrintPlanejado
          key={`print-${caso.ordem}-${idx}`}
          caso={caso}
          onVisualizar={() => onVisualizarPasso(caso)}
        />
      ))}
    </BlocoColapsavel>
  )
}

function ListaCasosRoteiro({
  itens,
  onVisualizarPasso,
}: {
  itens: CasoPlanoTesteApi[]
  onVisualizarPasso: (caso: CasoPlanoTesteApi) => void
}) {
  const etapas = useMemo(() => [...new Set(itens.map(c => c.titulo))], [itens])
  const [etapasColapsadas, setEtapasColapsadas] = useState<Set<string>>(() => new Set(etapas))

  useEffect(() => {
    setEtapasColapsadas(new Set(etapas))
  }, [etapas])

  const todasColapsadas = etapas.length > 0 && etapasColapsadas.size === etapas.length

  function toggleEtapa(etapa: string) {
    setEtapasColapsadas(prev => {
      const next = new Set(prev)
      if (next.has(etapa)) next.delete(etapa)
      else next.add(etapa)
      return next
    })
  }

  function toggleTodasEtapas() {
    setEtapasColapsadas(prev =>
      prev.size === etapas.length ? new Set() : new Set(etapas),
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {etapas.length > 1 && (
        <button
          type="button"
          onClick={toggleTodasEtapas}
          style={{
            alignSelf: 'flex-end',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.5rem',
            border: 'none',
            borderRadius: '6px',
            background: 'transparent',
            color: '#64748b',
            fontSize: '0.68rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <CaretDown
            size={12}
            weight="bold"
            style={{
              transition: 'transform 0.15s ease',
              transform: todasColapsadas ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
            aria-hidden
          />
          {todasColapsadas ? 'Expandir todas' : 'Recolher todas'}
        </button>
      )}
      {etapas.map(etapa => {
        const passosEtapa = itens.filter(c => c.titulo === etapa)
        return (
          <BlocoColapsavel
            key={etapa}
            titulo={etapa}
            contagem={passosEtapa.length}
            colapsado={etapasColapsadas.has(etapa)}
            onToggle={() => toggleEtapa(etapa)}
          >
            {passosEtapa.map((caso, idx) => (
              <LinhaCaso
                key={`${etapa}-${caso.ordem}-${idx}`}
                ordem={caso.ordem}
                detalhe={caso.detalhe}
                onVisualizar={() => onVisualizarPasso(caso)}
              />
            ))}
          </BlocoColapsavel>
        )
      })}
    </div>
  )
}

function corTipo(tipo: string): { bg: string; cor: string; borda: string } {
  if (tipo === 'EMT') {
    return { bg: 'rgba(245, 158, 11, 0.15)', cor: '#fcd34d', borda: 'rgba(245, 158, 11, 0.35)' }
  }
  if (tipo === 'E2E') {
    return { bg: 'rgba(99, 102, 241, 0.15)', cor: '#a5b4fc', borda: 'rgba(99, 102, 241, 0.35)' }
  }
  return { bg: 'rgba(167, 139, 250, 0.15)', cor: '#c4b5fd', borda: 'rgba(167, 139, 250, 0.3)' }
}

export function ModalDetalhePlanoTeste({ aberto, plano, ambiente, aoFechar }: ModalDetalhePlanoTesteProps) {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [casos, setCasos] = useState<CasoPlanoTesteApi[]>([])
  const [objetivo, setObjetivo] = useState<string | null>(null)
  const [planoFile, setPlanoFile] = useState<string | null>(null)
  const [ambienteExecucao, setAmbienteExecucao] = useState<AmbienteExecucaoApi | null>(null)
  const [casoDetalhe, setCasoDetalhe] = useState<CasoPlanoTesteApi | null>(null)

  useEffect(() => {
    if (!aberto || !plano) {
      setCasos([])
      setObjetivo(null)
      setPlanoFile(null)
      setAmbienteExecucao(null)
      setErro(null)
      setCasoDetalhe(null)
      return
    }

    setCarregando(true)
    setErro(null)
    adminPlanosTesteApi.casos(plano.id, ambiente)
      .then(res => {
        setCasos(res.casos)
        setObjetivo(res.objetivo)
        setPlanoFile(res.planoFile)
        setAmbienteExecucao(res.ambienteExecucao)
      })
      .catch(err => {
        setCasos([])
        setObjetivo(null)
        setPlanoFile(null)
        setAmbienteExecucao(null)
        setErro(err instanceof Error ? err.message : 'Erro ao carregar casos do plano')
      })
      .finally(() => setCarregando(false))
  }, [aberto, plano?.id, ambiente])

  if (!plano) return null

  const estilo = corTipo(plano.tipo)
  const titulo = plano.tela ?? plano.modulo ?? plano.sublocal
  const ORDEM_SECOES = ['Roteiro', 'Prints planejados', 'Fluxos', 'Passos E2E'] as const
  const secoesUnicas = [...new Set(casos.map(c => c.secao).filter(Boolean))] as string[]
  const secoes = [
    ...ORDEM_SECOES.filter(s => secoesUnicas.includes(s)),
    ...secoesUnicas.filter(s => !ORDEM_SECOES.includes(s as typeof ORDEM_SECOES[number])),
  ]

  return (
    <>
    <ModalOverlay
      aberto={aberto}
      aoFechar={aoFechar}
      tamanho="lg"
      titulo=""
      cabecalhoPersonalizado={
        <div style={{ padding: '1.5rem 1.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: estilo.bg, border: `1px solid ${estilo.borda}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: estilo.cor,
            }}>
              <ListChecks size={22} weight="fill" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 800, padding: '2px 5px', borderRadius: '3px',
                  background: estilo.bg, color: estilo.cor, border: `1px solid ${estilo.borda}`,
                }}>
                  {plano.tipo}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>{plano.id}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>{titulo}</h2>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                {plano.sublocal}
                {typeof plano.casosTotal === 'number' && ` · ${plano.casosTotal} casos no registry`}
                {typeof plano.passosTotal === 'number' && ` · ${plano.passosTotal} passos`}
              </p>
            </div>
          </div>
        </div>
      }
      renderizarFooter={() => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
          <button
            type="button"
            onClick={aoFechar}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '8px',
              background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </div>
      )}
    >
      <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ambienteExecucao && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            background: ambienteExecucao.ambiente === 'Producao'
              ? 'rgba(245, 158, 11, 0.1)'
              : ambienteExecucao.ambiente === 'Staging'
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(16, 185, 129, 0.08)',
            border: ambienteExecucao.ambiente === 'Producao'
              ? '1px solid rgba(245, 158, 11, 0.35)'
              : ambienteExecucao.ambiente === 'Staging'
                ? '1px solid rgba(99, 102, 241, 0.35)'
                : '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: ambienteExecucao.ambiente === 'Producao' ? '#fcd34d' : '#cbd5e1',
          }}>
            <Globe size={18} weight="fill" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                Ambiente de execução: {ambienteExecucao.rotulo}
              </div>
              <div>UI: <code>{ambienteExecucao.uiUrl}</code></div>
              {ambienteExecucao.ambiente !== 'Local' && (
                <div>API: <code>{ambienteExecucao.apiUrl}</code></div>
              )}
              <div style={{ marginTop: '0.35rem', opacity: 0.9 }}>{ambienteExecucao.nota}</div>
            </div>
          </div>
        )}

        {objetivo && (
          <div>
            <div style={{
              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: '#10b981',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              marginBottom: '0.5rem',
            }}>
              <Crosshair size={13} weight="fill" />
              Objetivo
            </div>
            <div style={{
              padding: '0.875rem 1rem', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55,
            }}>
              {objetivo}
            </div>
          </div>
        )}

        <div style={{
          fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#6366f1',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <Flask size={13} weight="fill" />
          {carregando
            ? 'Carregando casos...'
            : `O que será testado (${casos.length} item${casos.length !== 1 ? 's' : ''})`}
        </div>

        {erro && (
          <div style={{
            padding: '0.875rem 1rem', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5', fontSize: '0.8rem',
          }}>
            {erro}
          </div>
        )}

        {!carregando && !erro && casos.length === 0 && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Nenhum caso estruturado encontrado no plano.
            {planoFile && <> Ver arquivo: <code>{planoFile}</code></>}
          </p>
        )}

        {!carregando && casos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {(secoes.length > 0 ? secoes : [undefined]).map(secao => {
              const itens = secao ? casos.filter(c => c.secao === secao) : casos
              return (
                <div key={secao ?? 'todos'}>
                  {secao && secao !== 'Prints planejados' && (
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa',
                      marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {secao}
                    </div>
                  )}
                  {secao === 'Roteiro' ? (
                    <ListaCasosRoteiro itens={itens} onVisualizarPasso={setCasoDetalhe} />
                  ) : secao === 'Prints planejados' ? (
                    <ListaPrintsPlanejados itens={itens} onVisualizarPasso={setCasoDetalhe} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {itens.map((caso, idx) => (
                        <div key={`${caso.ordem}-${idx}`} style={estiloLinhaCaso}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
                            fontFamily: 'ui-monospace, monospace',
                          }}>
                            {caso.ordem}
                          </span>
                          <div>
                            {caso.titulo && (
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                                {caso.titulo}
                              </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: caso.titulo ? '0.15rem' : 0, lineHeight: 1.45 }}>
                              <DetalhePassoComPrints detalhe={caso.detalhe} />
                            </div>
                          </div>
                          <BotaoVisualizarPasso onClick={() => setCasoDetalhe(caso)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {plano.specFile && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px',
            background: 'rgba(100, 116, 139, 0.08)', border: '1px solid rgba(100, 116, 139, 0.25)',
            fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.55,
          }}>
            <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
              <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Script de execução
            </div>
            <code style={{ color: '#a5b4fc', wordBreak: 'break-all' }}>{plano.specFile}</code>
            <div style={{ marginTop: '0.35rem' }}>
              É o arquivo que o runner executa ao rodar este plano — cada caso listado acima
              está implementado como um teste dentro dele. Se um caso falhar, o resultado
              aponta o caso pelo código (ex.: o número/ID da linha acima).
            </div>
          </div>
        )}
      </div>
    </ModalOverlay>
    {casoDetalhe && (
      <ModalPassoPlanoTeste caso={casoDetalhe} aoFechar={() => setCasoDetalhe(null)} />
    )}
    </>
  )
}
