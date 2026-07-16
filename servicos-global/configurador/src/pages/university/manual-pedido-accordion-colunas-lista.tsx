import React, { useMemo, useState } from 'react'
import { CaretDown, Columns, LockSimple, MagnifyingGlass } from '@phosphor-icons/react'
import {
  GRUPOS_CATALOGO_COLUNAS_PEDIDO,
  TOTAL_COLUNAS_CATALOGO_PEDIDO,
  TOTAL_COLUNAS_EDICAO_MASSA_LISTA_PEDIDO,
  TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO,
} from './manual-pedido-catalogo-colunas-dados'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

type ColunaCatalogoAccordion = {
  ordem: number
  coluna: string
  descricao: string
  fixa?: boolean
  visivelPadrao?: boolean
  formatacao?: string
  edicaoPedido?: string
  edicaoItem?: string
  edicaoMassaPedido?: string
  edicaoMassaItem?: string
  edicao?: string
  soma?: string
  espelha?: string
}

type GrupoCatalogoAccordion = {
  id: string
  titulo: string
  nivel: 'pedido' | 'item' | 'leitura' | 'documento'
  colunas: ColunaCatalogoAccordion[]
}

function renderizarTextoComNegrito(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, i) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>
    }
    return parte
  })
}

function normalizarBusca(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function colunaCorrespondeBusca(
  coluna: ColunaCatalogoAccordion,
  busca: string,
) {
  if (!busca) return true
  const meta = coluna.formatacao
    ? ` ${coluna.formatacao} ${coluna.edicaoPedido ?? ''} ${coluna.edicaoItem ?? ''} ${coluna.edicaoMassaPedido ?? ''} ${coluna.edicaoMassaItem ?? ''} ${coluna.soma ?? ''} ${coluna.espelha ?? ''}`
    : coluna.edicao
      ? ` ${coluna.edicao}`
      : ''
  const alvo = normalizarBusca(`${coluna.coluna} ${coluna.descricao}${meta}`)
  return alvo.includes(busca)
}

function linhaTemMetadadosCatalogo(linha: ColunaCatalogoAccordion): boolean {
  return Boolean(linha.formatacao)
}

function CelulaMeta({ valor, corDestaque }: { valor: string; corDestaque?: string }) {
  if (!valor || valor === '—') {
    return <span style={{ color: '#64748b' }}>—</span>
  }
  return (
    <span style={{ color: corDestaque ?? CORPO_70, fontSize: '.7rem', lineHeight: 1.45 }}>
      {valor}
    </span>
  )
}

type PropsCatalogoAccordion = {
  titulo: string
  badge: string
  grupos: GrupoCatalogoAccordion[]
  totalColunas: number
  /** Smart Docs abre tudo; Pedido recolhe por padrão. */
  abertoPorPadrao?: boolean
  accent?: 'amber' | 'indigo'
  marginTop?: number
  /** Exibe colunas Formato, Edição P/I, Soma e Espelha (catálogo completo Pedido). */
  mostrarMetadadosCatalogo?: boolean
  /** Exibe Massa P/I em vez de Edição P/I (catálogo edição em massa). */
  mostrarMetadadosEdicaoMassa?: boolean
  /** Exibe coluna única Edição + descrição (catálogo Smart Docs). */
  mostrarEdicaoSimples?: boolean
  /** Texto abaixo do accordion (rodapé). */
  rodape?: string
  /** Substitui o prefixo Pedido/Item/Leitura nos títulos dos grupos (ex.: Cotação). */
  prefixoNivelGrupo?: string
}

export function ManualPedidoAccordionColunasLista({
  titulo,
  badge,
  grupos,
  totalColunas,
  abertoPorPadrao = false,
  accent = 'amber',
  marginTop = 20,
  mostrarMetadadosCatalogo = false,
  mostrarMetadadosEdicaoMassa = false,
  mostrarEdicaoSimples = false,
  rodape,
  prefixoNivelGrupo,
}: PropsCatalogoAccordion) {
  const [busca, setBusca] = useState('')
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(grupos.map((g) => [g.id, abertoPorPadrao])),
  )

  const buscaNormalizada = normalizarBusca(busca)
  const corIcone = accent === 'amber' ? '#f59e0b' : '#818cf8'
  const corBadge = accent === 'amber' ? '#fcd34d' : '#c7d2fe'
  const fundoBadge = accent === 'amber' ? 'rgba(245,158,11,.18)' : 'rgba(99,102,241,.18)'
  const bordaBadge = accent === 'amber' ? 'rgba(245,158,11,.35)' : 'rgba(129,140,248,.35)'
  const fundoHeaderAberto = accent === 'amber' ? 'rgba(245,158,11,.1)' : 'rgba(99,102,241,.1)'

  const gruposFiltrados = useMemo(() => {
    return grupos
      .map((grupo) => ({
        ...grupo,
        colunas: grupo.colunas.filter((coluna) => colunaCorrespondeBusca(coluna, buscaNormalizada)),
      }))
      .filter((grupo) => grupo.colunas.length > 0)
  }, [buscaNormalizada, grupos])

  const totalVisivel = gruposFiltrados.reduce((acc, grupo) => acc + grupo.colunas.length, 0)

  function alternarGrupo(id: string) {
    setGruposAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const thBase: React.CSSProperties = {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: '.62rem',
    fontWeight: 700,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(148,163,184,.12)',
    background: 'rgba(8,12,24,.18)',
  }

  const exibirMetadados = mostrarMetadadosCatalogo || mostrarMetadadosEdicaoMassa
    || grupos.some((g) => g.colunas.some(linhaTemMetadadosCatalogo))
  const exibirEdicaoSimples = mostrarEdicaoSimples && !exibirMetadados
  const exibirPadrao = !mostrarMetadadosEdicaoMassa && grupos.some((g) => g.colunas.some((c) => c.visivelPadrao))
  const rotuloEdicaoPedido = mostrarMetadadosEdicaoMassa ? 'Massa P' : 'Edição P'
  const rotuloEdicaoItem = mostrarMetadadosEdicaoMassa ? 'Massa I' : 'Edição I'

  const tdBase: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: '.76rem',
    lineHeight: 1.5,
    verticalAlign: 'top',
    borderBottom: '1px solid rgba(148,163,184,.08)',
  }

  return (
    <div style={{
      marginTop,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: accent === 'amber'
        ? 'linear-gradient(145deg, rgba(245,158,11,.06) 0%, rgba(148,163,184,.04) 50%, rgba(129,140,248,.04) 100%)'
        : 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: '1px solid rgba(148,163,184,.1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}>
        <p style={{
          fontSize: '.68rem',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 auto',
        }}>
          <Columns size={16} weight="duotone" color={corIcone} />
          {titulo}
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: corBadge,
            background: fundoBadge,
            border: `1px solid ${bordaBadge}`,
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {buscaNormalizada ? `${totalVisivel} de ${totalColunas}` : badge}
          </span>
        </p>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 220px',
          maxWidth: 320,
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid rgba(148,163,184,.2)',
          background: 'rgba(8,12,24,.35)',
        }}>
          <MagnifyingGlass size={15} weight="bold" color="#64748b" aria-hidden />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Filtrar coluna…"
            aria-label="Filtrar colunas da lista"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--ws-text, #f1f5f9)',
              fontSize: '.78rem',
            }}
          />
        </label>
      </div>

      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {gruposFiltrados.length === 0 ? (
          <p style={{ margin: '8px 4px', fontSize: '.78rem', color: CORPO_70 }}>
            Nenhuma coluna corresponde a «{busca}».
          </p>
        ) : gruposFiltrados.map((grupo) => {
          const aberto = gruposAbertos[grupo.id] ?? abertoPorPadrao
          const prefixoNivel = prefixoNivelGrupo ?? (grupo.nivel === 'pedido'
            ? 'Pedido'
            : grupo.nivel === 'item'
              ? 'Item'
              : grupo.nivel === 'leitura'
                ? 'Leitura'
                : 'Documento')
          return (
            <section
              key={grupo.id}
              style={{
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,.12)',
                background: 'rgba(8,12,24,.22)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => alternarGrupo(grupo.id)}
                aria-expanded={aberto}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: aberto ? fundoHeaderAberto : 'rgba(148,163,184,.04)',
                  color: 'var(--ws-text, #f1f5f9)',
                  textAlign: 'left',
                }}
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  color={corIcone}
                  style={{
                    flexShrink: 0,
                    transform: aberto ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .2s',
                  }}
                />
                <span style={{ fontWeight: 700, fontSize: '.78rem', flex: 1 }}>
                  {prefixoNivel} · {grupo.titulo}
                </span>
                <span style={{
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  background: 'rgba(148,163,184,.12)',
                  borderRadius: 999,
                  padding: '2px 8px',
                }}>
                  {grupo.colunas.length}
                </span>
              </button>
              {aberto && (
                <div style={{ overflowX: 'auto', borderTop: '1px solid rgba(148,163,184,.08)' }}>
                  <table style={{ width: '100%', minWidth: exibirMetadados ? (exibirPadrao ? 1040 : 980) : exibirEdicaoSimples ? 620 : 480, borderCollapse: 'collapse' }}>
                    {(exibirMetadados || exibirEdicaoSimples) && (
                      <thead>
                        <tr>
                          <th style={{ ...thBase, width: exibirMetadados ? '5%' : '8%' }}>#</th>
                          <th style={{ ...thBase, width: exibirMetadados ? (exibirPadrao ? '14%' : '16%') : '24%' }}>Coluna</th>
                          {exibirMetadados && (
                            <>
                              <th style={{ ...thBase, width: '8%' }}>Formato</th>
                              {exibirPadrao && (
                                <th style={{ ...thBase, width: '7%' }}>Padrão</th>
                              )}
                              <th style={{ ...thBase, width: '10%' }}>{rotuloEdicaoPedido}</th>
                              <th style={{ ...thBase, width: '10%' }}>{rotuloEdicaoItem}</th>
                              <th style={{ ...thBase, width: exibirPadrao ? '16%' : '18%' }}>Soma</th>
                              <th style={{ ...thBase, width: exibirPadrao ? '16%' : '18%' }}>Espelha</th>
                            </>
                          )}
                          {exibirEdicaoSimples && (
                            <th style={{ ...thBase, width: '12%' }}>Edição</th>
                          )}
                          <th style={{ ...thBase, width: exibirMetadados ? '15%' : undefined }}>O que mostra</th>
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {grupo.colunas.map((linha, i) => {
                        const meta = linhaTemMetadadosCatalogo(linha)
                        return (
                          <tr
                            key={`${grupo.id}-${linha.coluna}-${linha.ordem}`}
                            style={{
                              background: i % 2 === 0 ? 'rgba(8,12,24,.12)' : 'transparent',
                            }}
                          >
                            <td style={{
                              ...tdBase,
                              width: exibirMetadados ? '5%' : '8%',
                              color: '#64748b',
                              fontWeight: 600,
                              textAlign: 'center',
                            }}>
                              {String(linha.ordem).padStart(2, '0')}
                            </td>
                            <td style={{
                              ...tdBase,
                              width: exibirMetadados ? '16%' : '30%',
                              fontWeight: 600,
                              color: '#e2e8f0',
                            }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                {linha.coluna}
                                {linha.fixa && (
                                  <LockSimple
                                    size={13}
                                    weight="duotone"
                                    color={corIcone}
                                    aria-label="Coluna fixa — não pode ser ocultada"
                                  />
                                )}
                              </span>
                            </td>
                            {exibirMetadados && meta && (
                              <>
                                <td style={{ ...tdBase, width: '8%' }}>
                                  <CelulaMeta valor={linha.formatacao} corDestaque="#fcd34d" />
                                </td>
                                {exibirPadrao && (
                                  <td style={{ ...tdBase, width: '7%', textAlign: 'center' }}>
                                    {linha.visivelPadrao ? (
                                      <span style={{
                                        fontSize: '.62rem',
                                        fontWeight: 700,
                                        color: '#6ee7b7',
                                        background: 'rgba(52,211,153,.12)',
                                        border: '1px solid rgba(52,211,153,.28)',
                                        borderRadius: 999,
                                        padding: '2px 8px',
                                      }}>
                                        Sim
                                      </span>
                                    ) : (
                                      <span style={{ color: '#64748b' }}>—</span>
                                    )}
                                  </td>
                                )}
                                <td style={{ ...tdBase, width: '10%' }}>
                                  <CelulaMeta valor={
                                    mostrarMetadadosEdicaoMassa
                                      ? (linha.edicaoMassaPedido ?? '—')
                                      : (linha.edicaoPedido ?? '—')
                                  } />
                                </td>
                                <td style={{ ...tdBase, width: '10%' }}>
                                  <CelulaMeta valor={
                                    mostrarMetadadosEdicaoMassa
                                      ? (linha.edicaoMassaItem ?? '—')
                                      : (linha.edicaoItem ?? '—')
                                  } />
                                </td>
                                <td style={{ ...tdBase, width: '18%' }}>
                                  <CelulaMeta valor={linha.soma} corDestaque="#93c5fd" />
                                </td>
                                <td style={{ ...tdBase, width: '18%' }}>
                                  <CelulaMeta valor={linha.espelha} corDestaque="#6ee7b7" />
                                </td>
                              </>
                            )}
                            {exibirMetadados && !meta && (
                              <>
                                <td style={tdBase} colSpan={5} />
                              </>
                            )}
                            {exibirEdicaoSimples && (
                              <td style={{ ...tdBase, width: '12%' }}>
                                <CelulaMeta
                                  valor={linha.edicao ?? '—'}
                                  corDestaque={linha.edicao === 'Link' ? '#93c5fd' : undefined}
                                />
                              </td>
                            )}
                            <td style={{ ...tdBase, color: CORPO_70, width: exibirMetadados ? '15%' : undefined }}>
                              {renderizarTextoComNegrito(linha.descricao)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )
        })}
      </div>
      {rodape && (
        <p style={{
          margin: 0,
          padding: '12px 18px 14px',
          fontSize: '.68rem',
          lineHeight: 1.55,
          color: CORPO_70,
          borderTop: '1px solid rgba(148,163,184,.1)',
        }}>
          {rodape}
        </p>
      )}
    </div>
  )
}

/** Manual Pedido §05 — catálogo completo nativo (accordion recolhido por padrão). */
export function ManualPedidoTabelaCatalogoColunasLista() {
  return (
    <ManualPedidoAccordionColunasLista
      titulo="Colunas da Lista"
      badge={`${TOTAL_COLUNAS_CATALOGO_PEDIDO} colunas · ${TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO} no Padrão`}
      grupos={GRUPOS_CATALOGO_COLUNAS_PEDIDO}
      totalColunas={TOTAL_COLUNAS_CATALOGO_PEDIDO}
      abertoPorPadrao={false}
      accent="amber"
      marginTop={12}
      mostrarMetadadosCatalogo
      rodape={`Colunas com Padrão = Sim são as que o painel Padrão já abre na primeira visita (${TOTAL_COLUNAS_PADRAO_LISTA_PEDIDO} de ${TOTAL_COLUNAS_CATALOGO_PEDIDO}). Use o menu Colunas para exibir, ocultar e reordenar; o layout salva no painel ativo.`}
    />
  )
}

/** Manual Pedido § Edição em massa — catálogo com colunas Massa P / Massa I. */
export function ManualPedidoTabelaCatalogoColunasEdicaoMassa() {
  return (
    <ManualPedidoAccordionColunasLista
      titulo="Colunas da Lista"
      badge={`${TOTAL_COLUNAS_CATALOGO_PEDIDO} colunas · ${TOTAL_COLUNAS_EDICAO_MASSA_LISTA_PEDIDO} na edição em massa`}
      grupos={GRUPOS_CATALOGO_COLUNAS_PEDIDO}
      totalColunas={TOTAL_COLUNAS_CATALOGO_PEDIDO}
      abertoPorPadrao={false}
      accent="indigo"
      marginTop={12}
      mostrarMetadadosEdicaoMassa
      rodape={`Massa P = editável em massa no nível Pedido (ou Combinado). Massa I = editável no nível Item. Campos calculados, somente leitura e únicos (ex.: Nº do Pedido) com vários pedidos selecionados ficam bloqueados. Colunas criadas pelo usuário também entram.`}
    />
  )
}
