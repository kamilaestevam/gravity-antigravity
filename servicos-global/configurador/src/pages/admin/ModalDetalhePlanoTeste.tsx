import React, { useEffect, useState } from 'react'
import { ListChecks, Flask, FileText, Globe } from '@phosphor-icons/react'
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

function LinhaCaso({ ordem, detalhe }: { ordem: string; detalhe: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{
        fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
        fontFamily: 'ui-monospace, monospace',
      }}>
        {ordem}
      </span>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
        {detalhe}
      </div>
    </div>
  )
}

function ListaCasosRoteiro({ itens }: { itens: CasoPlanoTesteApi[] }) {
  const etapas = [...new Set(itens.map(c => c.titulo))]
  let sequencia = 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {etapas.map(etapa => (
        <div key={etapa}>
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa',
            marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {etapa}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {itens.filter(c => c.titulo === etapa).map(caso => {
              sequencia += 1
              return (
                <LinhaCaso
                  key={`${etapa}-${sequencia}`}
                  ordem={String(sequencia)}
                  detalhe={caso.detalhe}
                />
              )
            })}
          </div>
        </div>
      ))}
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
  const [planoFile, setPlanoFile] = useState<string | null>(null)
  const [ambienteExecucao, setAmbienteExecucao] = useState<AmbienteExecucaoApi | null>(null)

  useEffect(() => {
    if (!aberto || !plano) {
      setCasos([])
      setPlanoFile(null)
      setAmbienteExecucao(null)
      setErro(null)
      return
    }

    setCarregando(true)
    setErro(null)
    adminPlanosTesteApi.casos(plano.id, ambiente)
      .then(res => {
        setCasos(res.casos)
        setPlanoFile(res.planoFile)
        setAmbienteExecucao(res.ambienteExecucao)
      })
      .catch(err => {
        setCasos([])
        setPlanoFile(null)
        setAmbienteExecucao(null)
        setErro(err instanceof Error ? err.message : 'Erro ao carregar casos do plano')
      })
      .finally(() => setCarregando(false))
  }, [aberto, plano?.id, ambiente])

  if (!plano) return null

  const estilo = corTipo(plano.tipo)
  const titulo = plano.tela ?? plano.modulo ?? plano.sublocal
  const secoes = [...new Set(casos.map(c => c.secao).filter(Boolean))] as string[]

  return (
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

        {plano.specFile && (
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Script: <code style={{ color: '#94a3b8' }}>{plano.specFile}</code>
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
                  {secao && (
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa',
                      marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {secao}
                    </div>
                  )}
                  {secao === 'Roteiro' ? (
                    <ListaCasosRoteiro itens={itens} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {itens.map((caso, idx) => (
                        <div
                          key={`${caso.ordem}-${idx}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '48px 1fr',
                            gap: '0.75rem',
                            padding: '0.625rem 0.75rem',
                            borderRadius: '8px',
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 800, color: '#818cf8',
                            fontFamily: 'ui-monospace, monospace',
                          }}>
                            {caso.ordem}
                          </span>
                          <div>
                            {caso.titulo && caso.secao !== 'Prints planejados' && (
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>
                                {caso.titulo}
                              </div>
                            )}
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: caso.titulo ? '0.15rem' : 0, lineHeight: 1.45 }}>
                              {caso.secao === 'Prints planejados'
                                ? (
                                  <>
                                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{caso.titulo}</span>
                                    {' — '}
                                    {caso.detalhe}
                                  </>
                                )
                                : caso.detalhe}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ModalOverlay>
  )
}
