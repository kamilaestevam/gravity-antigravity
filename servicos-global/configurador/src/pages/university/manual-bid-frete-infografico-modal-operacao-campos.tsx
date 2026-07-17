import React from 'react'
import {
  AirplaneTilt,
  Anchor,
  ArrowDown,
  ArrowUp,
  Boat,
  Hash,
  ListChecks,
  TruckTrailer,
  Warning,
  type Icon,
} from '@phosphor-icons/react'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'
import { ManualBidFreteGuiaAoVivo } from './manual-bid-frete-guia-ao-vivo'
import type {
  ModalGuiaTag,
  ModalidadeGuiaTag,
  OperacaoGuiaTag,
} from './manual-bid-frete-guia-modal-operacao-tags'

const CORPO_70 = 'color-mix(in srgb, var(--ws-text, #f1f5f9) 70%, transparent)'

export type CampoModalOperacaoId =
  | 'numero_cotacao'
  | 'tipo_operacao'
  | 'modal_frete'
  | 'modalidade'
  | 'carga_perigosa'

type CampoModalOperacao = {
  id: CampoModalOperacaoId
  num: string
  rotulo: string
  paragrafoGuia: string
  descricaoPontos: string[]
  obrigatorio: boolean
  obrigatorioNota?: string
  aplicavelOperacao: OperacaoGuiaTag[]
  aplicavelModal: ModalGuiaTag[]
  aplicavelModalidade: ModalidadeGuiaTag[]
  habilitaPassosPosteriores: string[]
  icone: Icon
  cor: string
  borda: string
  fundo: string
  opcoes?: { rotulo: string; cor: string; icone?: Icon }[]
}

/** SSOT — metadados completos dos campos do passo Modal e Operação (infográfico + Guia ao vivo). */
export const CAMPOS_MODAL_OPERACAO_BID_FRETE: CampoModalOperacao[] = [
  {
    id: 'numero_cotacao',
    num: '01',
    rotulo: 'Nº da cotação',
    paragrafoGuia:
      'Identificador único da solicitação. O sistema gera automaticamente no formato **COT-YYYYMMDD-NNNN**; você pode personalizar antes de criar.',
    descricaoPontos: ['Identificador único', 'Gerado pelo sistema', 'Pode ser editado'],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Exibição e busca na **lista de cotações**',
      'Identificação no passo **Resumo** e nos convites a fornecedores',
    ],
    icone: Hash,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    id: 'tipo_operacao',
    num: '02',
    rotulo: 'Tipo de operação',
    paragrafoGuia:
      'Define a direção da operação: **Importação** (entrada no país) ou **Exportação** (saída). Orienta validações de origem e destino nos passos seguintes.',
    descricaoPontos: ['Importação', 'Exportação'],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Rótulos e validações de **origem** e **destino** no passo **Origem e Destino**',
      'Badges de direção na **lista** e no **Resumo** da cotação',
    ],
    icone: ArrowDown,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.08)',
    opcoes: [
      { rotulo: 'Importação', cor: '#2dd4bf', icone: ArrowDown },
      { rotulo: 'Exportação', cor: '#fbbf24', icone: ArrowUp },
    ],
  },
  {
    id: 'modal_frete',
    num: '03',
    rotulo: 'Modal de frete',
    paragrafoGuia:
      'Meio de transporte da cotação: **Marítimo**, **Aéreo** ou **Rodoviário**. Determina quais campos aparecem em **Modalidade** e no passo **Carga e Incoterm**.',
    descricaoPontos: ['Marítimo', 'Aéreo', 'Rodoviário'],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Bloco **Modalidade** (Marítimo: FCL/LCL; Rodoviário: FTL/LTL; Aéreo: oculto)',
      'Campos de **Origem e Destino** (porto, aeroporto ou endereço rodoviário)',
      'Estrutura do passo **Carga e Incoterm** (containers, volumes ou linhas FCL)',
      'Passo extra **Armazenagem** quando Marítimo + **LCL**',
    ],
    icone: Boat,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
    opcoes: [
      { rotulo: 'Marítimo', cor: '#38bdf8', icone: Anchor },
      { rotulo: 'Aéreo', cor: '#a78bfa', icone: AirplaneTilt },
      { rotulo: 'Rodoviário', cor: '#fbbf24', icone: TruckTrailer },
    ],
  },
  {
    id: 'modalidade',
    num: '04',
    rotulo: 'Modalidade',
    paragrafoGuia:
      'Disponível após escolher o modal (exceto **Aéreo**). **Marítimo**: **FCL** ou **LCL**. **Rodoviário**: **FTL** ou **LTL**.',
    descricaoPontos: [
      'Somente após selecionar o modal de frete',
      'Marítimo: FCL ou LCL',
      'Rodoviário: FTL ou LTL',
      'Aéreo: bloco não aparece nesta tela',
    ],
    obrigatorio: true,
    obrigatorioNota: 'Necessário quando o bloco está visível (Marítimo ou Rodoviário)',
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      '**FCL**: linhas de container no passo **Carga e Incoterm**',
      '**LCL**: volumes fracionados + passo **Armazenagem** (Marítimo)',
      '**FTL / LTL**: tipo de volume e cubagem rodoviária no passo **Carga**',
    ],
    icone: ListChecks,
    cor: '#c4b5fd',
    borda: 'rgba(196,181,253,.28)',
    fundo: 'rgba(167,139,250,.08)',
  },
  {
    id: 'carga_perigosa',
    num: '05',
    rotulo: 'Carga perigosa',
    paragrafoGuia:
      'Marque quando a mercadoria é classificada **ONU** (IMDG / ADR / IATA DGR). O **número ONU** é informado no passo **Carga e Incoterm**.',
    descricaoPontos: [
      'Mercadoria classificada ONU (IMDG / ADR / IATA DGR)',
      'Informe o número ONU no passo Carga',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Campos **número ONU**, **nome técnico**, **classe** e **grupo de embalagem** no passo **Carga e Incoterm**',
      'Validação obrigatória desses campos antes de avançar quando marcada',
    ],
    icone: Warning,
    cor: '#fb7185',
    borda: 'rgba(251,113,133,.28)',
    fundo: 'rgba(244,63,94,.08)',
  },
]

function renderizarNegrito(texto: string) {
  return texto.split('**').map((parte, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#cbd5e1', fontWeight: 700 }}>{parte}</strong>
      : parte,
  )
}

function CardCampo({
  campo,
  destacado,
  textoContextual,
  compacto = false,
}: {
  campo: CampoModalOperacao
  destacado: boolean
  textoContextual?: string
  compacto?: boolean
}) {
  const Icone = campo.icone
  const paragrafoExibir = destacado && textoContextual ? textoContextual : campo.paragrafoGuia

  return (
    <div
      style={{
        borderRadius: 12,
        padding: compacto ? '12px 12px 10px' : '14px 14px 12px',
        background: campo.fundo,
        border: destacado
          ? `2px solid ${campo.cor}`
          : `1px solid ${campo.borda}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: compacto ? 8 : 10,
        width: '100%',
        textAlign: 'left',
        boxShadow: destacado
          ? `0 0 0 1px color-mix(in srgb, ${campo.cor} 40%, transparent), 0 8px 24px rgba(0,0,0,.18)`
          : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8,12,24,.35)',
          border: `1px solid ${campo.borda}`,
        }}>
          <Icone size={20} weight="duotone" color={campo.cor} aria-hidden />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: '.62rem',
              fontWeight: 800,
              letterSpacing: '.06em',
              color: campo.cor,
            }}>
              {campo.num}
            </span>
            <p style={{
              margin: 0,
              fontSize: '.78rem',
              fontWeight: 800,
              color: '#e2e8f0',
              lineHeight: 1.35,
            }}>
              {campo.rotulo}
            </p>
          </div>
          <p style={{
            margin: 0,
            fontSize: compacto ? '.72rem' : '.75rem',
            lineHeight: 1.5,
            color: CORPO_70,
          }}>
            {renderizarNegrito(paragrafoExibir)}
          </p>
        </div>
      </div>
      {!compacto && campo.descricaoPontos?.length ? (
        <ul style={{
          margin: 0,
          paddingLeft: 18,
          width: '100%',
          fontSize: '12px',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          {campo.descricaoPontos.map((ponto) => (
            <li key={ponto} style={{ marginBottom: 2 }}>{ponto}</li>
          ))}
        </ul>
      ) : null}
      {!compacto && campo.opcoes?.length ? (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 8px',
          paddingLeft: 48,
        }}>
          {campo.opcoes.map((opcao) => {
            const IconeOpcao = opcao.icone
            return (
              <span
                key={opcao.rotulo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '.62rem',
                  fontWeight: 700,
                  color: opcao.cor,
                  background: 'rgba(8,12,24,.28)',
                  border: `1px solid color-mix(in srgb, ${opcao.cor} 35%, transparent)`,
                  borderRadius: 999,
                  padding: '3px 9px',
                }}
              >
                {IconeOpcao ? <IconeOpcao size={12} weight="duotone" aria-hidden /> : null}
                {opcao.rotulo}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

type ManualInfograficoBidFreteModalOperacaoCamposProps = {
  campoDestacado?: CampoModalOperacaoId | null
  textoContextual?: string
  modoGuiaInterativo?: boolean
  tituloBloco?: string
}

export type SelecaoGuiaModalOperacao = {
  id: CampoModalOperacaoId
  valor: string
}

import type { ContextoSimuladorModalOperacao } from './manual-bid-frete-guia-modal-operacao-tags'

type ManualBidFreteGuiaStickyModalOperacaoProps = {
  selecoes: SelecaoGuiaModalOperacao[]
  campoAtivo: CampoModalOperacaoId | null
  textoContextual?: string
  contextoSimulador?: ContextoSimuladorModalOperacao
  onSelecionarCampo: (id: CampoModalOperacaoId) => void
}

/** Painel sticky — mantém escolhas visíveis (lista) + card do campo ativo. */
export function ManualBidFreteGuiaStickyModalOperacao({
  selecoes,
  campoAtivo,
  textoContextual,
  contextoSimulador,
  onSelecionarCampo,
}: ManualBidFreteGuiaStickyModalOperacaoProps) {
  return (
    <ManualBidFreteGuiaAoVivo
      campos={CAMPOS_MODAL_OPERACAO_BID_FRETE}
      selecoes={selecoes}
      campoAtivo={campoAtivo}
      textoContextual={textoContextual}
      contextoSimulador={contextoSimulador}
      onSelecionarCampo={onSelecionarCampo}
    />
  )
}

/** Manual BID Frete §4.02.01 — guia dos campos do passo Modal e Operação. */
export function ManualInfograficoBidFreteModalOperacaoCampos({
  campoDestacado = null,
  textoContextual,
  modoGuiaInterativo = false,
  tituloBloco = 'Campos deste passo',
}: ManualInfograficoBidFreteModalOperacaoCamposProps = {}) {
  const camposVisiveis = modoGuiaInterativo
    ? CAMPOS_MODAL_OPERACAO_BID_FRETE.filter((campo) => campo.id === campoDestacado)
    : CAMPOS_MODAL_OPERACAO_BID_FRETE

  if (modoGuiaInterativo && camposVisiveis.length === 0) {
    return null
  }

  const campoAtivo = camposVisiveis[0]

  return (
    <div
      role="group"
      aria-label="Campos do passo Modal e Operação: Nova cotação manual"
      style={{
        marginTop: modoGuiaInterativo ? MANUAL_ESPACO_PARAGRAFO_PX : 0,
        background: 'linear-gradient(165deg, rgba(99,102,241,.07) 0%, rgba(148,163,184,.04) 55%, rgba(45,212,191,.04) 100%)',
        border: '1px solid rgba(129,140,248,.18)',
        borderRadius: 14,
        padding: '18px 18px 16px',
        boxShadow: '0 8px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.03)',
      }}
    >
      <p style={{
        margin: '0 0 4px',
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#c4b5fd',
      }}>
        {modoGuiaInterativo ? 'Guia do campo selecionado' : tituloBloco}
      </p>
      {modoGuiaInterativo && campoAtivo ? (
        <p style={{
          margin: '0 0 12px',
          fontSize: '.75rem',
          lineHeight: 1.45,
          color: CORPO_70,
        }}>
          {`Explicação para ${campoAtivo.rotulo} conforme a opção escolhida na tela acima.`}
        </p>
      ) : (
        <div style={{ marginBottom: 12 }} />
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: modoGuiaInterativo ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {camposVisiveis.map((campo) => (
          <CardCampo
            key={campo.num}
            campo={campo}
            destacado={modoGuiaInterativo || campoDestacado === campo.id}
            textoContextual={textoContextual}
          />
        ))}
      </div>
    </div>
  )
}
