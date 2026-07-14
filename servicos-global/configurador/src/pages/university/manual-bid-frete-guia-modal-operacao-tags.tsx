import React from 'react'
import {
  AirplaneTilt,
  Anchor,
  ArrowDown,
  ArrowUp,
  SquaresFour,
  TruckTrailer,
  type Icon,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'

export type OperacaoGuiaTag = 'IMPORTACAO' | 'EXPORTACAO'
export type ModalGuiaTag = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
export type ModalidadeGuiaTag = 'FCL' | 'LCL' | 'FTL' | 'LTL'

export type ContextoSimuladorModalOperacao = {
  tipo_operacao: OperacaoGuiaTag | ''
  modal_frete: ModalGuiaTag | ''
  modalidade: ModalidadeGuiaTag | ''
}

export type EstadoTagGuia = 'ativo' | 'aplica' | 'inativo'

type TagConfig = {
  id: string
  rotulo: string
  cor: string
  icone?: Icon
  tooltipTitulo: string
  tooltipDescricao: string
}

const TAG_OPERACAO: TagConfig[] = [
  {
    id: 'IMPORTACAO',
    rotulo: 'Importação',
    cor: '#2dd4bf',
    icone: ArrowDown,
    tooltipTitulo: 'Importação',
    tooltipDescricao: 'Cotações de frete de entrada no país',
  },
  {
    id: 'EXPORTACAO',
    rotulo: 'Exportação',
    cor: '#fbbf24',
    icone: ArrowUp,
    tooltipTitulo: 'Exportação',
    tooltipDescricao: 'Cotações de frete de saída para o exterior',
  },
]

const TAG_MODAL: TagConfig[] = [
  {
    id: 'MARITIMO',
    rotulo: 'Marítimo',
    cor: '#38bdf8',
    icone: Anchor,
    tooltipTitulo: 'Marítimo',
    tooltipDescricao: 'Transporte por navio; habilita FCL ou LCL',
  },
  {
    id: 'AEREO',
    rotulo: 'Aéreo',
    cor: '#a78bfa',
    icone: AirplaneTilt,
    tooltipTitulo: 'Aéreo',
    tooltipDescricao: 'Transporte aéreo; sem modalidade nesta tela',
  },
  {
    id: 'RODOVIARIO',
    rotulo: 'Rodoviário',
    cor: '#fbbf24',
    icone: TruckTrailer,
    tooltipTitulo: 'Rodoviário',
    tooltipDescricao: 'Transporte por caminhão; habilita FTL ou LTL',
  },
]

const TAG_MODALIDADE: TagConfig[] = [
  {
    id: 'FCL',
    rotulo: 'FCL',
    cor: '#38bdf8',
    tooltipTitulo: 'FCL',
    tooltipDescricao: 'Container completo; só no modal Marítimo',
  },
  {
    id: 'LCL',
    rotulo: 'LCL',
    cor: '#38bdf8',
    tooltipTitulo: 'LCL',
    tooltipDescricao: 'Carga fracionada marítima; só no modal Marítimo',
  },
  {
    id: 'FTL',
    rotulo: 'FTL',
    cor: '#fbbf24',
    tooltipTitulo: 'FTL',
    tooltipDescricao: 'Caminhão completo; só no modal Rodoviário',
  },
  {
    id: 'LTL',
    rotulo: 'LTL',
    cor: '#fbbf24',
    tooltipTitulo: 'LTL',
    tooltipDescricao: 'Carga fracionada rodoviária; só no modal Rodoviário',
  },
]

function resolverEstadoTag(
  id: string,
  aplicavel: readonly string[],
  contexto: ContextoSimuladorModalOperacao | undefined,
  tipoContexto: 'operacao' | 'modal' | 'modalidade',
  exibirTodasAtivas = false,
  perfilTagsPorto = false,
  perfilTagsTipoOperacao = false,
  perfilTagsModalidade = false,
): EstadoTagGuia {
  if (exibirTodasAtivas) return 'ativo'

  if (perfilTagsTipoOperacao && tipoContexto === 'operacao') {
    if (!contexto?.tipo_operacao) return 'aplica'
    return contexto.tipo_operacao === id ? 'ativo' : 'inativo'
  }

  if (perfilTagsModalidade && tipoContexto === 'modalidade') {
    if (!contexto?.modalidade) return 'aplica'
    return contexto.modalidade === id ? 'ativo' : 'inativo'
  }

  if (perfilTagsPorto) {
    if (contexto?.modal_frete === 'RODOVIARIO') {
      if (tipoContexto === 'operacao') {
        if (!contexto.tipo_operacao) return 'aplica'
        return contexto.tipo_operacao === id ? 'ativo' : 'inativo'
      }
      if (tipoContexto === 'modal') return id === 'RODOVIARIO' ? 'ativo' : 'inativo'
      if (id === 'FCL' || id === 'LCL') return 'inativo'
      if (!contexto.modalidade) return 'aplica'
      return contexto.modalidade === id ? 'ativo' : 'inativo'
    }
    if (contexto?.modal_frete === 'MARITIMO') {
      if (tipoContexto === 'operacao') return 'ativo'
      if (tipoContexto === 'modal') return id === 'MARITIMO' ? 'ativo' : 'inativo'
      return id === 'FCL' || id === 'LCL' ? 'ativo' : 'inativo'
    }
  }

  const aplicaCampo = aplicavel.length === 0 || aplicavel.includes(id)

  if (!contexto) {
    return aplicaCampo ? 'aplica' : 'inativo'
  }

  if (!aplicaCampo) return 'inativo'

  if (tipoContexto === 'operacao') {
    if (!contexto.tipo_operacao) return 'aplica'
    return contexto.tipo_operacao === id ? 'ativo' : 'aplica'
  }

  if (tipoContexto === 'modal') {
    if (!contexto.modal_frete) return 'aplica'
    // Modal já escolhido: só o selecionado fica ativo; os demais ficam inativos
    // (ex.: Marítimo → Aéreo e Rodoviário desabilitados nesta cotação).
    return contexto.modal_frete === id ? 'ativo' : 'inativo'
  }

  const maritimoAtivo = contexto.modal_frete === 'MARITIMO'
  const rodoviarioAtivo = contexto.modal_frete === 'RODOVIARIO'
  const modalidadeMaritima = id === 'FCL' || id === 'LCL'
  const modalidadeRodoviaria = id === 'FTL' || id === 'LTL'

  if (contexto.modal_frete === 'AEREO') return 'inativo'
  if (!contexto.modal_frete) return 'aplica'

  if (modalidadeMaritima && !maritimoAtivo) return 'inativo'
  if (modalidadeRodoviaria && !rodoviarioAtivo) return 'inativo'

  if (contexto.modalidade === id) return 'ativo'
  return 'aplica'
}

function TagChip({
  tag,
  estado,
  somenteIcone = false,
}: {
  tag: TagConfig
  estado: EstadoTagGuia
  somenteIcone?: boolean
}) {
  const Icone = tag.icone
  const ativo = estado === 'ativo'
  const inativo = estado === 'inativo'
  const aplica = estado === 'aplica'

  const chip = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        minWidth: somenteIcone ? 30 : Icone ? 34 : 36,
        height: 28,
        padding: somenteIcone ? 0 : '0 8px',
        borderRadius: 8,
        fontSize: '.6rem',
        fontWeight: 800,
        letterSpacing: '.04em',
        color: inativo ? 'rgba(148,163,184,.38)' : tag.cor,
        background: inativo
          ? 'rgba(15,23,42,.35)'
          : ativo
            ? `color-mix(in srgb, ${tag.cor} 22%, rgba(8,12,24,.55))`
            : `color-mix(in srgb, ${tag.cor} 10%, rgba(8,12,24,.45))`,
        border: inativo
          ? '1px solid rgba(255,255,255,.05)'
          : `1.5px solid color-mix(in srgb, ${tag.cor} ${ativo ? '70%' : aplica ? '38%' : '20%'}, transparent)`,
        boxShadow: ativo
          ? `0 0 0 1px color-mix(in srgb, ${tag.cor} 28%, transparent), 0 2px 8px color-mix(in srgb, ${tag.cor} 18%, transparent)`
          : 'none',
        opacity: inativo ? 0.42 : 1,
        cursor: 'default',
        transition: 'border-color .15s ease, background .15s ease, opacity .15s ease',
      }}
    >
      {Icone ? <Icone size={14} weight={ativo ? 'fill' : 'duotone'} aria-hidden /> : tag.rotulo}
      {!somenteIcone && Icone ? (
        <span style={{ fontSize: '.56rem', fontWeight: 800 }}>{tag.rotulo}</span>
      ) : null}
    </span>
  )

  return (
    <TooltipGlobal
      titulo={tag.tooltipTitulo}
      descricao={inativo ? `${tag.tooltipDescricao}; não se aplica agora` : tag.tooltipDescricao}
      posicaoPreferida="acima"
    >
      {chip}
    </TooltipGlobal>
  )
}

function SeparadorTags() {
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        height: 20,
        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.18), transparent)',
        flexShrink: 0,
        margin: '0 3px',
      }}
    />
  )
}

type TagsContextoCampoGuiaProps = {
  aplicavelOperacao: readonly OperacaoGuiaTag[]
  aplicavelModal: readonly ModalGuiaTag[]
  aplicavelModalidade: readonly ModalidadeGuiaTag[]
  contexto?: ContextoSimuladorModalOperacao
  exibirTodasAtivas?: boolean
  perfilTagsPorto?: boolean
  perfilTagsTipoOperacao?: boolean
  perfilTagsModalidade?: boolean
}

/** Tags de contexto — operação, modal e modalidade (FCL/LCL/FTL/LTL sempre visíveis). */
export function TagsContextoCampoGuia({
  aplicavelOperacao,
  aplicavelModal,
  aplicavelModalidade,
  contexto,
  exibirTodasAtivas = false,
  perfilTagsPorto = false,
  perfilTagsTipoOperacao = false,
  perfilTagsModalidade = false,
}: TagsContextoCampoGuiaProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '10px 10px 9px',
      borderRadius: 9,
      background: 'rgba(8,12,24,.28)',
      border: '1px solid rgba(255,255,255,.06)',
    }}>
      <p style={{
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontSize: '.62rem',
        fontWeight: 800,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#cbd5e1',
      }}>
        <SquaresFour size={13} weight="duotone" color="#94a3b8" aria-hidden />
        Aplica-se em
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 7px',
      }}>
        {TAG_OPERACAO.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            estado={resolverEstadoTag(tag.id, aplicavelOperacao, contexto, 'operacao', exibirTodasAtivas, perfilTagsPorto, perfilTagsTipoOperacao, perfilTagsModalidade)}
            somenteIcone
          />
        ))}
        <SeparadorTags />
        {TAG_MODAL.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            estado={resolverEstadoTag(tag.id, aplicavelModal, contexto, 'modal', exibirTodasAtivas, perfilTagsPorto, perfilTagsTipoOperacao, perfilTagsModalidade)}
            somenteIcone
          />
        ))}
        <SeparadorTags />
        {TAG_MODALIDADE.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            estado={resolverEstadoTag(tag.id, aplicavelModalidade, contexto, 'modalidade', exibirTodasAtivas, perfilTagsPorto, perfilTagsTipoOperacao, perfilTagsModalidade)}
          />
        ))}
      </div>
    </div>
  )
}
