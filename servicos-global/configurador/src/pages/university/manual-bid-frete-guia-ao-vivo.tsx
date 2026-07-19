import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowFatLinesUp,
  CaretDown,
  CheckCircle,
  CursorClick,
  Info,
  ListBullets,
  type Icon,
} from '@phosphor-icons/react'
import {
  TagsContextoCampoGuia,
  type ContextoSimuladorModalOperacao,
  type ModalGuiaTag,
  type ModalidadeGuiaTag,
  type OperacaoGuiaTag,
} from './manual-bid-frete-guia-modal-operacao-tags'

const CORPO = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 78%, transparent)'
const CORPO_MUTED = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 58%, transparent)'

/** Campos cujos 9 chips "Aplica-se em" ficam todos ativos, sem filtro pelo modal/tipo escolhido. */
const CAMPOS_GUIA_TAGS_TODAS_ATIVAS = new Set<string>([
  'carga_perigosa',
  'portos_proximos_origem',
  'portos_proximos_destino',
  'coleta_origem',
  'entrega_destino',
  'ncm',
  'descricao_mercadoria',
  'hs_code',
  'numero_onu',
  'quantidade',
  'peso_cubagem',
  'incoterm',
  'valor_alvo',
  'prazo_respostas',
  'fornecedor_pode_alterar',
  'tipo_visibilidade',
  'proposta_anonima',
  'fornecedores',
])

/** Porto de embarque/destino — perfil fixo marítimo (imagem de referência). */
const CAMPOS_GUIA_TAGS_PERFIL_PORTO = new Set<string>(['porto_origem', 'porto_destino'])

/** Metadados de um campo acompanhado pelo painel Guia ao vivo. */
export type CampoGuiaAoVivo<Id extends string = string> = {
  id: Id
  num: string
  rotulo: string
  paragrafoGuia: string
  icone: Icon
  cor: string
  borda: string
  fundo: string
  descricaoPontos?: string[]
  obrigatorio?: boolean
  obrigatorioNota?: string
  aplicavelOperacao?: OperacaoGuiaTag[]
  aplicavelModal?: ModalGuiaTag[]
  aplicavelModalidade?: ModalidadeGuiaTag[]
  habilitaPassosPosteriores?: string[]
}

export type SelecaoGuiaAoVivo<Id extends string = string> = {
  id: Id
  valor: string
}

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#e2e8f0', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function TituloSecaoGuia({
  children,
  icone: IconeSecao,
  cor = '#94a3b8',
}: {
  children: React.ReactNode
  icone: Icon
  cor?: string
}) {
  return (
    <p style={{
      margin: '0 0 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: '.62rem',
      fontWeight: 800,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: '#cbd5e1',
    }}>
      <IconeSecao size={13} weight="duotone" color={cor} aria-hidden style={{ flexShrink: 0 }} />
      {children}
    </p>
  )
}

function BadgeObrigatoriedade({
  obrigatorio,
  nota,
}: {
  obrigatorio: boolean
  nota?: string
}) {
  const cor = obrigatorio ? '#f87171' : '#94a3b8'
  const fundo = obrigatorio ? 'rgba(248,113,113,.1)' : 'rgba(148,163,184,.08)'
  const borda = obrigatorio ? 'rgba(248,113,113,.28)' : 'rgba(148,163,184,.18)'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 8,
      background: fundo,
      border: `1px solid ${borda}`,
    }}>
      <span style={{
        flexShrink: 0,
        marginTop: 1,
        fontSize: '.58rem',
        fontWeight: 800,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        color: cor,
        background: obrigatorio ? 'rgba(248,113,113,.16)' : 'rgba(148,163,184,.12)',
        border: `1px solid ${borda}`,
        borderRadius: 5,
        padding: '2px 7px',
      }}>
        {obrigatorio ? 'Obrigatório' : 'Opcional'}
      </span>
      <p style={{
        margin: 0,
        fontSize: '.68rem',
        lineHeight: 1.45,
        color: obrigatorio ? '#fecaca' : CORPO_MUTED,
      }}>
        {nota ?? (obrigatorio
          ? 'Necessário para avançar neste passo'
          : 'Pode ficar em branco neste passo')}
      </p>
    </div>
  )
}

function ConteudoExpandidoGuia<Id extends string>({
  campo,
  textoExplicacao,
  contextoSimulador,
}: {
  campo: CampoGuiaAoVivo<Id>
  textoExplicacao?: string
  contextoSimulador?: ContextoSimuladorModalOperacao
}) {
  const paragrafo = textoExplicacao || campo.paragrafoGuia
  const temMetadadosRicos = campo.descricaoPontos?.length
    || campo.aplicavelOperacao?.length
    || campo.habilitaPassosPosteriores?.length
    || campo.obrigatorio !== undefined
  const tagsTodasAtivas = CAMPOS_GUIA_TAGS_TODAS_ATIVAS.has(campo.id)
  const perfilTagsPorto = CAMPOS_GUIA_TAGS_PERFIL_PORTO.has(campo.id)

  if (!paragrafo && !temMetadadosRicos) return null

  return (
    <div
      className="sim-guia-card-ativo"
      style={{
        padding: '14px 12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        borderTop: `1px solid color-mix(in srgb, ${campo.cor} 22%, transparent)`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${campo.cor} 7%, transparent) 0%, rgba(8,12,24,.18) 100%)`,
      }}
    >
      {paragrafo ? (
        <div>
          <TituloSecaoGuia icone={Info} cor={campo.cor}>O que significa</TituloSecaoGuia>
          <p style={{
            margin: 0,
            fontSize: '.74rem',
            lineHeight: 1.58,
            color: CORPO,
          }}>
            {renderizarNegrito(paragrafo)}
          </p>
        </div>
      ) : null}

      {campo.descricaoPontos?.length ? (
        <div>
          <TituloSecaoGuia icone={ListBullets} cor={campo.cor}>Opções deste campo</TituloSecaoGuia>
          <ul style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {campo.descricaoPontos.map((ponto) => (
              <li
                key={ponto}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: '.72rem',
                  lineHeight: 1.45,
                  color: '#e2e8f0',
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    marginTop: 7,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: campo.cor,
                    boxShadow: `0 0 0 2px color-mix(in srgb, ${campo.cor} 25%, transparent)`,
                  }}
                />
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {campo.aplicavelOperacao?.length && campo.aplicavelModal?.length && campo.aplicavelModalidade?.length ? (
        <TagsContextoCampoGuia
          aplicavelOperacao={campo.aplicavelOperacao}
          aplicavelModal={campo.aplicavelModal}
          aplicavelModalidade={campo.aplicavelModalidade}
          contexto={tagsTodasAtivas ? undefined : contextoSimulador}
          exibirTodasAtivas={tagsTodasAtivas}
          perfilTagsPorto={perfilTagsPorto}
          perfilTagsTipoOperacao={campo.id === 'tipo_operacao'}
          perfilTagsModalidade={campo.id === 'modalidade'}
        />
      ) : null}

      {campo.obrigatorio !== undefined ? (
        <BadgeObrigatoriedade
          obrigatorio={campo.obrigatorio}
          nota={campo.obrigatorioNota}
        />
      ) : null}

      {campo.habilitaPassosPosteriores?.length ? (
        <div style={{
          padding: '11px 11px 10px',
          borderRadius: 9,
          background: 'rgba(99,102,241,.07)',
          border: '1px solid rgba(129,140,248,.18)',
        }}>
          <TituloSecaoGuia icone={ArrowFatLinesUp} cor="#818cf8">
            Habilita nos passos seguintes
          </TituloSecaoGuia>
          <ul style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}>
            {campo.habilitaPassosPosteriores.map((item) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: '.72rem',
                  lineHeight: 1.5,
                  color: '#e2e8f0',
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 5,
                    height: 5,
                    marginTop: 7,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: '#818cf8',
                  }}
                />
                <span>{renderizarNegrito(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function LinhaGuiaAoVivo<Id extends string>({
  campo,
  valor,
  expandida,
  textoExplicacao,
  contextoSimulador,
  onToggle,
}: {
  campo: CampoGuiaAoVivo<Id>
  valor: string
  expandida: boolean
  textoExplicacao?: string
  contextoSimulador?: ContextoSimuladorModalOperacao
  onToggle: () => void
}) {
  const Icone = campo.icone

  return (
    <div style={{
      borderRadius: 12,
      border: expandida
        ? `1.5px solid ${campo.cor}`
        : '1px solid rgba(255, 255, 255, 0.07)',
      background: expandida
        ? `linear-gradient(165deg, ${campo.fundo} 0%, rgba(15,23,42,.55) 100%)`
        : 'rgba(255, 255, 255, 0.03)',
      boxShadow: expandida
        ? `0 0 0 1px color-mix(in srgb, ${campo.cor} 28%, transparent), 0 8px 22px rgba(0,0,0,.28)`
        : 'none',
      overflow: 'hidden',
      transition: 'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        title={`${campo.rotulo}: ${valor}`}
        aria-expanded={expandida}
        aria-label={expandida ? `Recolher ${campo.rotulo}` : `Expandir ${campo.rotulo}`}
        className="sim-guia-linha"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: expandida ? '11px 12px 10px' : '8px 10px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{
          width: 30,
          height: 30,
          borderRadius: 9,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: expandida
            ? `color-mix(in srgb, ${campo.cor} 18%, rgba(8,12,24,.5))`
            : 'rgba(8,12,24,.45)',
          border: `1px solid ${expandida ? campo.cor : campo.borda}`,
          boxShadow: expandida
            ? `0 0 0 1px color-mix(in srgb, ${campo.cor} 20%, transparent)`
            : 'none',
        }}>
          <Icone size={15} weight={expandida ? 'fill' : 'duotone'} color={campo.cor} aria-hidden />
        </span>
        <span style={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: 'hidden',
        }}>
          <span style={{
            fontSize: '.58rem',
            fontWeight: 800,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: expandida ? campo.cor : 'rgba(148,163,184,.9)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.2,
          }}>
            {campo.num} · {campo.rotulo}
          </span>
          <span style={{
            fontSize: '.78rem',
            fontWeight: 700,
            color: '#f1f5f9',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.25,
          }}>
            {valor}
          </span>
        </span>
        <CheckCircle
          size={16}
          weight="fill"
          color={expandida ? campo.cor : 'var(--success, #22c55e)'}
          aria-hidden
          style={{ flexShrink: 0 }}
        />
        <CaretDown
          size={13}
          weight="bold"
          color={expandida ? campo.cor : 'rgba(148,163,184,.7)'}
          aria-hidden
          style={{
            flexShrink: 0,
            transform: expandida ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
      {expandida ? (
        <ConteudoExpandidoGuia
          campo={campo}
          textoExplicacao={textoExplicacao}
          contextoSimulador={contextoSimulador}
        />
      ) : null}
    </div>
  )
}

type ManualBidFreteGuiaAoVivoProps<Id extends string> = {
  campos: readonly CampoGuiaAoVivo<Id>[]
  selecoes: SelecaoGuiaAoVivo<Id>[]
  campoAtivo: Id | null
  textoContextual?: string
  contextoSimulador?: ContextoSimuladorModalOperacao
  onSelecionarCampo?: (id: Id) => void
  /** Anima o estado vazio enquanto a demo aguarda o primeiro clique. */
  conviteInterativo?: boolean
  /** Sobrescreve o texto do estado vazio (antes do primeiro clique). */
  textoConviteVazio?: string
}

const TEXTO_CONVITE_VAZIO_GUIA_AO_VIVO_PADRAO =
  'Selecione uma opção na tela ao lado: cada escolha fica registrada aqui. Ao entrar em um campo, o card expande; ao passar para o próximo, contrai. Clique em um card já preenchido se quiser revisar os detalhes.'

/** Painel sticky «Guia ao vivo» — escolhas visíveis + explicação do campo em foco. */
export function ManualBidFreteGuiaAoVivo<Id extends string>({
  campos,
  selecoes,
  campoAtivo,
  textoContextual,
  contextoSimulador,
  conviteInterativo = false,
  textoConviteVazio = TEXTO_CONVITE_VAZIO_GUIA_AO_VIVO_PADRAO,
}: ManualBidFreteGuiaAoVivoProps<Id>) {
  const totalCampos = campos.length
  const progresso = totalCampos > 0 ? Math.min(selecoes.length / totalCampos, 1) : 0
  const listaRef = useRef<HTMLDivElement>(null)
  const cardAbertoRef = useRef<HTMLDivElement>(null)
  const [cardAbertoId, setCardAbertoId] = useState<Id | null>(null)

  const resolverCampo = (id: Id) => campos.find((campo) => campo.id === id)

  useEffect(() => {
    if (campoAtivo) setCardAbertoId(campoAtivo)
  }, [campoAtivo])

  useEffect(() => {
    if (!cardAbertoId || !cardAbertoRef.current || !listaRef.current) return
    cardAbertoRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [cardAbertoId, selecoes.length])

  return (
    <aside
      className="sim-guia-sticky-col"
      aria-label="Guia interativo: campos selecionados"
    >
      <div className="sim-guia-sticky-col__cabecalho">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}>
          <p className="sim-guia-sticky-col__titulo">
            Guia ao vivo
          </p>
          <span className={`sim-guia-sticky-col__contador${selecoes.length > 0 ? ' sim-guia-sticky-col__contador--ativo' : ''}`}>
            {selecoes.length} / {totalCampos}
          </span>
        </div>

        <div
          aria-hidden
          className="sim-guia-sticky-col__progresso-trilho"
        >
          <div
            className="sim-guia-sticky-col__progresso-barra"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>
      </div>

      {selecoes.length > 0 ? (
        <div
          ref={listaRef}
          className="sim-guia-sticky-col__lista"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
          }}
        >
          {selecoes.map((selecao) => {
            const campo = resolverCampo(selecao.id)
            if (!campo) return null
            const expandida = cardAbertoId === selecao.id
            return (
              <div key={selecao.id} ref={expandida ? cardAbertoRef : undefined}>
                <LinhaGuiaAoVivo
                  campo={campo}
                  valor={selecao.valor}
                  expandida={expandida}
                  textoExplicacao={
                    expandida && cardAbertoId === campoAtivo ? textoContextual : undefined
                  }
                  contextoSimulador={contextoSimulador}
                  onToggle={() => {
                    setCardAbertoId((prev) => (prev === selecao.id ? null : selecao.id))
                  }}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div
          className={[
            'sim-guia-sticky-col__lista',
            'sim-guia-convite-vazio',
            conviteInterativo ? 'sim-guia-convite-vazio--ativo' : '',
          ].filter(Boolean).join(' ')}
        >
          <span
            className={conviteInterativo ? 'sim-guia-convite-vazio__icone sim-affordance-guia-convite' : 'sim-guia-convite-vazio__icone'}
          >
            <CursorClick size={24} weight="duotone" color="var(--ws-accent, var(--color-primary, #818cf8))" aria-hidden />
          </span>
          <p className="sim-guia-convite-vazio__texto">
            {textoConviteVazio}
          </p>
        </div>
      )}
    </aside>
  )
}
