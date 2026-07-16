import React, { useMemo, useState } from 'react'
import { CaretDown, CheckCircle, ClockCounterClockwise, MagnifyingGlass, Prohibit } from '@phosphor-icons/react'
import {
  HISTORICO_CATALOGO_SECOES,
  type HistoricoCatalogoSecao,
} from './manual-historico-catalogo'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export const TOTAL_EVENTOS_CATALOGO_HISTORICO_CONFIGURADOR = HISTORICO_CATALOGO_SECOES.reduce(
  (acc, secao) => acc + secao.linhas.length,
  0,
)

function slugSecao(titulo: string) {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

function textoLinhaBusca(linha: Record<string, string | boolean | undefined>) {
  return Object.entries(linha)
    .filter(([chave]) => chave !== 'emBreve')
    .map(([, valor]) => String(valor ?? ''))
    .join(' ')
}

function secaoCorrespondeBusca(secao: HistoricoCatalogoSecao, busca: string) {
  if (!busca) return true
  const alvo = normalizarBusca(
    `${secao.titulo} ${secao.notaRodape ?? ''} ${secao.linhas.map((l) => textoLinhaBusca(l)).join(' ')}`,
  )
  return alvo.includes(busca)
}

function linhaCorrespondeBusca(linha: Record<string, string | boolean | undefined>, busca: string) {
  if (!busca) return true
  return normalizarBusca(textoLinhaBusca(linha)).includes(busca)
}

function tituloCurtoProdutosProntos(operacao: string) {
  const semNegrito = operacao.replace(/\*\*/g, '')
  const antesDoisPontos = semNegrito.split(':')[0]?.trim()
  if (antesDoisPontos && antesDoisPontos.length <= 72) return antesDoisPontos
  return semNegrito.length > 72 ? `${semNegrito.slice(0, 69)}…` : semNegrito
}

const TH_BASE: React.CSSProperties = {
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

const TD_BASE: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: '.76rem',
  lineHeight: 1.5,
  verticalAlign: 'top',
  borderBottom: '1px solid rgba(148,163,184,.08)',
}

function TagEmBreveCatalogo() {
  return (
    <span
      aria-label="Em breve"
      style={{
        fontSize: '.58rem',
        fontWeight: 700,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color: '#fbbf24',
        background: 'rgba(251,191,36,.1)',
        border: '1px solid rgba(251,191,36,.32)',
        borderRadius: 999,
        padding: '2px 8px',
        flexShrink: 0,
        lineHeight: 1.2,
      }}
    >
      Em breve
    </span>
  )
}

function TabelaSecaoHistorico({ secao, busca }: { secao: HistoricoCatalogoSecao; busca: string }) {
  const linhas = secao.linhas.filter((l) => linhaCorrespondeBusca(l, busca))
  if (linhas.length === 0) {
    return (
      <p style={{ margin: '10px 14px', fontSize: '.76rem', color: CORPO_70 }}>
        Nenhum item nesta seção corresponde ao filtro.
      </p>
    )
  }

  const minWidth = Math.max(480, secao.colunas.length * 110)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {secao.colunas.map((col) => (
              <th
                key={col.chave}
                style={{
                  ...TH_BASE,
                  width: col.largura,
                  color: col.destaque ? '#a5b4fc' : '#94a3b8',
                  background: col.destaque ? 'rgba(99,102,241,.08)' : 'rgba(8,12,24,.18)',
                }}
              >
                {col.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr
              key={`${secao.titulo}-${i}`}
              style={{ background: i % 2 === 0 ? 'rgba(8,12,24,.12)' : 'transparent' }}
            >
              {secao.colunas.map((col) => {
                const valor = String(linha[col.chave] ?? '')
                const ehNum = col.chave === 'num'
                const ehTecnico = col.chave === 'acao' || col.chave === 'campo' || col.chave === 'gatilho' || col.chave === 'prefixo'
                const ehUsuario = col.chave === 'traducao'
                const mostrarEmBreve = ehUsuario && linha.emBreve === true
                return (
                  <td
                    key={col.chave}
                    style={{
                      ...TD_BASE,
                      fontWeight: ehNum || col.destaque || ehUsuario ? 600 : 400,
                      color: ehNum ? '#94a3b8' : '#e2e8f0',
                      background: col.destaque ? 'rgba(99,102,241,.04)' : undefined,
                      fontFamily: ehTecnico
                        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                        : undefined,
                      fontSize: ehTecnico ? '.7rem' : '.76rem',
                    }}
                  >
                    {mostrarEmBreve ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {renderizarTextoComNegrito(valor)}
                        <TagEmBreveCatalogo />
                      </span>
                    ) : (
                      renderizarTextoComNegrito(valor)
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CamadaItemProdutosProntos({
  titulo,
  operacao,
  variante,
  aberto,
  onToggle,
}: {
  titulo: string
  operacao: string
  variante: 'registra' | 'nao-registra'
  aberto: boolean
  onToggle: () => void
}) {
  const corIcone = variante === 'registra' ? '#34d399' : '#94a3b8'
  const fundoAberto = variante === 'registra' ? 'rgba(52,211,153,.08)' : 'rgba(148,163,184,.06)'

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${variante === 'registra' ? 'rgba(52,211,153,.2)' : 'rgba(148,163,184,.12)'}`,
      background: 'rgba(8,12,24,.15)',
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aberto}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
          border: 'none',
          cursor: 'pointer',
          background: aberto ? fundoAberto : 'transparent',
          color: 'var(--ws-text, #f1f5f9)',
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, fontSize: '.78rem', fontWeight: 600, lineHeight: 1.4 }}>
          {variante === 'registra'
            ? <CheckCircle size={15} weight="duotone" color={corIcone} aria-hidden />
            : <Prohibit size={15} weight="duotone" color={corIcone} aria-hidden />}
          {titulo}
        </span>
        <CaretDown
          size={14}
          weight="bold"
          color="#94a3b8"
          style={{
            flexShrink: 0,
            transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .18s ease',
          }}
        />
      </button>
      {aberto ? (
        <div style={{
          padding: '10px 12px 12px',
          borderTop: '1px solid rgba(148,163,184,.08)',
          fontSize: '.76rem',
          lineHeight: 1.55,
          color: CORPO_70,
        }}>
          {renderizarTextoComNegrito(operacao)}
        </div>
      ) : null}
    </div>
  )
}

function ProdutosProntosCamadas({
  secao,
  busca,
}: {
  secao: HistoricoCatalogoSecao
  busca: string
}) {
  const registra = secao.linhas.filter((l) => l.traducao === 'Registra' && linhaCorrespondeBusca(l, busca))
  const naoRegistra = secao.linhas.filter((l) => l.traducao === 'Não registra' && linhaCorrespondeBusca(l, busca))

  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({
    registra: true,
    'nao-registra': false,
  })
  const [itensAbertos, setItensAbertos] = useState<Record<string, boolean>>({})

  function alternarGrupo(id: string) {
    setGruposAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function alternarItem(id: string) {
    setItensAbertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (registra.length === 0 && naoRegistra.length === 0) {
    return (
      <p style={{ margin: '10px 14px', fontSize: '.76rem', color: CORPO_70 }}>
        Nenhum item corresponde ao filtro.
      </p>
    )
  }

  const camadas = [
    {
      id: 'registra',
      titulo: 'Registra',
      descricao: 'Mudanças que persistem no servidor ou geram log dedicado.',
      variante: 'registra' as const,
      itens: registra.map((l, i) => ({
        id: `registra-${i}`,
        titulo: tituloCurtoProdutosProntos(l.operacao ?? ''),
        operacao: l.operacao ?? '',
      })),
    },
    {
      id: 'nao-registra',
      titulo: 'Não registra',
      descricao: 'Navegação, preferências locais e tentativas que não gravaram.',
      variante: 'nao-registra' as const,
      itens: naoRegistra.map((l, i) => ({
        id: `nao-registra-${i}`,
        titulo: tituloCurtoProdutosProntos(l.operacao ?? ''),
        operacao: l.operacao ?? '',
      })),
    },
  ].filter((c) => c.itens.length > 0)

  return (
    <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {camadas.map((camada) => {
        const grupoAberto = gruposAbertos[camada.id] ?? false
        const ehRegistra = camada.variante === 'registra'
        return (
          <section
            key={camada.id}
            style={{
              borderRadius: 12,
              border: `1px solid ${ehRegistra ? 'rgba(52,211,153,.22)' : 'rgba(148,163,184,.12)'}`,
              background: ehRegistra ? 'rgba(52,211,153,.04)' : 'rgba(8,12,24,.12)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => alternarGrupo(camada.id)}
              aria-expanded={grupoAberto}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 14px',
                border: 'none',
                cursor: 'pointer',
                background: grupoAberto
                  ? (ehRegistra ? 'rgba(52,211,153,.1)' : 'rgba(148,163,184,.08)')
                  : 'transparent',
                color: 'var(--ws-text, #f1f5f9)',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: '.82rem', fontWeight: 700, lineHeight: 1.35, color: ehRegistra ? '#6ee7b7' : '#cbd5e1' }}>
                  {camada.titulo}
                  <span style={{ marginLeft: 8, fontSize: '.65rem', fontWeight: 600, color: '#94a3b8' }}>
                    {camada.itens.length}
                  </span>
                </span>
                <span style={{ fontSize: '.72rem', color: CORPO_70, lineHeight: 1.45 }}>
                  {camada.descricao}
                </span>
              </span>
              <CaretDown
                size={16}
                weight="bold"
                color="#94a3b8"
                style={{
                  flexShrink: 0,
                  transform: grupoAberto ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform .18s ease',
                }}
              />
            </button>

            {grupoAberto ? (
              <div style={{
                padding: '10px 12px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderTop: '1px solid rgba(148,163,184,.08)',
              }}>
                {camada.itens.map((item) => (
                  <CamadaItemProdutosProntos
                    key={item.id}
                    titulo={item.titulo}
                    operacao={item.operacao}
                    variante={camada.variante}
                    aberto={itensAbertos[item.id] ?? ehRegistra}
                    onToggle={() => alternarItem(item.id)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        )
      })}
      {secao.notaRodape ? (
        <p style={{ margin: '4px 2px 0', fontSize: '.72rem', lineHeight: 1.5, color: CORPO_70 }}>
          {renderizarTextoComNegrito(secao.notaRodape)}
        </p>
      ) : null}
    </div>
  )
}

function ehSecaoProdutosProntos(secao: HistoricoCatalogoSecao) {
  return secao.titulo.startsWith('6. Produtos prontos')
}

type PropsAccordion = {
  marginTop?: number
  abertoPorPadrao?: boolean
}

export function ManualConfiguradorAccordionHistoricoCatalogo({
  marginTop = 8,
  abertoPorPadrao = false,
}: PropsAccordion) {
  const [busca, setBusca] = useState('')
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(HISTORICO_CATALOGO_SECOES.map((s) => [slugSecao(s.titulo), abertoPorPadrao])),
  )

  const buscaNormalizada = normalizarBusca(busca)

  const secoesFiltradas = useMemo(
    () => HISTORICO_CATALOGO_SECOES.filter((s) => secaoCorrespondeBusca(s, buscaNormalizada)),
    [buscaNormalizada],
  )

  const totalVisivel = secoesFiltradas.reduce((acc, s) => acc + s.linhas.length, 0)

  function alternarSecao(id: string) {
    setSecoesAbertas((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{
      marginTop,
      marginBottom: 8,
      borderRadius: 14,
      border: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(145deg, rgba(99,102,241,.06) 0%, rgba(148,163,184,.04) 50%, rgba(52,211,153,.04) 100%)',
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
          <ClockCounterClockwise size={16} weight="duotone" color="#a5b4fc" />
          Catálogo de eventos
          <span style={{
            fontSize: '.62rem',
            fontWeight: 700,
            letterSpacing: '.04em',
            textTransform: 'none',
            color: '#a5b4fc',
            background: 'rgba(99,102,241,.15)',
            border: '1px solid rgba(99,102,241,.35)',
            borderRadius: 999,
            padding: '2px 8px',
          }}>
            {buscaNormalizada
              ? `${totalVisivel} de ${TOTAL_EVENTOS_CATALOGO_HISTORICO_CONFIGURADOR}`
              : `${TOTAL_EVENTOS_CATALOGO_HISTORICO_CONFIGURADOR} eventos`}
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
            placeholder="Filtrar seção ou evento…"
            aria-label="Filtrar catálogo de eventos do histórico"
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
        {secoesFiltradas.length === 0 ? (
          <p style={{ margin: '8px 4px', fontSize: '.78rem', color: CORPO_70 }}>
            Nenhuma seção corresponde a «{busca}».
          </p>
        ) : secoesFiltradas.map((secao) => {
          const id = slugSecao(secao.titulo)
          const aberto = secoesAbertas[id] ?? abertoPorPadrao
          const contagem = secao.linhas.filter((l) => linhaCorrespondeBusca(l, buscaNormalizada)).length

          return (
            <section
              key={id}
              style={{
                borderRadius: 12,
                border: '1px solid rgba(148,163,184,.12)',
                background: 'rgba(8,12,24,.22)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => alternarSecao(id)}
                aria-expanded={aberto}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  border: 'none',
                  cursor: 'pointer',
                  background: aberto ? 'rgba(99,102,241,.1)' : 'transparent',
                  color: 'var(--ws-text, #f1f5f9)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '.82rem', fontWeight: 700, lineHeight: 1.35 }}>
                  {secao.titulo}
                  <span style={{ marginLeft: 8, fontSize: '.65rem', fontWeight: 600, color: '#94a3b8' }}>
                    {contagem}
                  </span>
                </span>
                <CaretDown
                  size={16}
                  weight="bold"
                  color="#94a3b8"
                  style={{
                    flexShrink: 0,
                    transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform .18s ease',
                  }}
                />
              </button>

              {aberto ? (
                <div style={{ borderTop: '1px solid rgba(148,163,184,.08)' }}>
                  {ehSecaoProdutosProntos(secao) ? (
                    <ProdutosProntosCamadas secao={secao} busca={buscaNormalizada} />
                  ) : (
                    <>
                      <TabelaSecaoHistorico secao={secao} busca={buscaNormalizada} />
                      {secao.notaRodape ? (
                        <p style={{
                          margin: 0,
                          padding: '10px 14px 12px',
                          fontSize: '.72rem',
                          lineHeight: 1.5,
                          color: CORPO_70,
                          borderTop: '1px solid rgba(148,163,184,.08)',
                        }}>
                          {renderizarTextoComNegrito(secao.notaRodape)}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </div>
  )
}
