import React from 'react'
import {
  AirplaneTilt,
  Anchor,
  Barcode,
  Buildings,
  CalendarBlank,
  CheckCircle,
  CurrencyCircleDollar,
  Eye,
  FileText,
  Hash,
  NotePencil,
  Package,
  PaperPlaneTilt,
  Ruler,
  Scales,
  ShippingContainer,
  Tag,
  Truck,
  Warning,
} from '@phosphor-icons/react'
import {
  ICONE_LABEL_SECAO,
  SimuladorNcSectionTitle,
} from './manual-bid-frete-simulador-nc-ui'
import type { EstadoCargaIncoterm, ContextoPassoCarga } from './manual-bid-frete-simulador-carga-incoterm'
import {
  resolverTextoLocalResumo,
  type EstadoOrigemDestino,
} from './manual-bid-frete-simulador-origem-destino'
import type { EstadoVisibilidade } from './manual-bid-frete-simulador-visibilidade'

type ModalFrete = 'MARITIMO' | 'AEREO' | 'RODOVIARIO' | ''
type TipoOperacao = 'IMPORTACAO' | 'EXPORTACAO' | ''
type Modalidade = 'FCL' | 'LCL' | 'FTL' | 'LTL' | ''

export type EstadoModalOperacaoResumo = {
  numero_cotacao: string
  tipo_operacao: TipoOperacao
  modal_frete: ModalFrete
  modalidade: Modalidade
  carga_perigosa: boolean
}

const ROTULO_VOLUME: Record<string, string> = {
  CAIXA: 'Caixa (CX)',
  PALLET: 'Pallet (PL)',
  UNIDADE: 'Unidade (UN)',
  FARDO: 'Fardo',
  SACO: 'Saco',
}

function rotuloOperacao(tipo: TipoOperacao): string {
  if (tipo === 'IMPORTACAO') return 'Importação'
  if (tipo === 'EXPORTACAO') return 'Exportação'
  return '—'
}

function rotuloModal(modal: ModalFrete, modalidade: Modalidade): string {
  if (modal === 'AEREO') return 'Aéreo'
  if (modal === 'MARITIMO') return modalidade ? `Marítimo / ${modalidade}` : 'Marítimo'
  if (modal === 'RODOVIARIO') return modalidade ? `Rodoviário / ${modalidade}` : 'Rodoviário'
  return '—'
}

function formatarDataBr(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

function textoVisibilidade(estado: EstadoVisibilidade): string {
  if (estado.tipo_visibilidade === 'ABERTA') {
    return estado.proposta_anonima
      ? 'Aberta — anônima'
      : 'Aberta — todos os fornecedores que aceitam cotação aberta'
  }
  if (estado.tipo_visibilidade === 'DIRECIONADA') {
    return estado.proposta_anonima
      ? 'Direcionada — anônima (apenas fornecedores selecionados)'
      : 'Direcionada — apenas os fornecedores selecionados recebem a cotação'
  }
  return '—'
}

function textoCanais(estado: EstadoVisibilidade): string {
  const partes: string[] = []
  if (estado.canais.includes('EMAIL')) partes.push('E-mail')
  if (estado.canais.includes('WHATSAPP')) partes.push('WhatsApp')
  return partes.join(' · ') || '—'
}

function textoQuantidadePeso(carga: EstadoCargaIncoterm, contexto: ContextoPassoCarga): string {
  const fcl = contexto.modal_frete === 'MARITIMO' && contexto.modalidade === 'FCL'
  if (fcl) {
    const total = carga.linhas_container_fcl.reduce((acc, l) => acc + (l.quantidade || 0), 0)
    const base = total > 0 ? `${total} ctn` : '—'
    return carga.peso_kg ? `${base} | ${carga.peso_kg} Kg` : base
  }
  const sufixo = carga.tipo_volume === 'UNIDADE' ? 'un' : (carga.tipo_volume?.toLowerCase() || 'un')
  const qtd = carga.quantidade_volume > 0 ? `${carga.quantidade_volume} ${sufixo}` : '—'
  if (carga.peso_kg) return `${qtd} | ${carga.peso_kg} Kg`
  return qtd
}

function textoCubagem(carga: EstadoCargaIncoterm): string | null {
  if (!carga.cubagem_detalhada) {
    return carga.cubagem_m3 ? `${carga.cubagem_m3} m³` : null
  }
  const un = carga.unidade_cubagem || 'CM'
  const dims = [carga.comprimento, carga.largura, carga.altura].every((v) => v.trim())
    ? `${carga.comprimento}x${carga.largura}x${carga.altura} ${un}`
    : ''
  const m3 = carga.cubagem_m3 ? `${carga.cubagem_m3} m³` : ''
  if (dims && m3) return `${dims} | ${m3}`
  return dims || m3 || null
}

function textoTipoVolume(carga: EstadoCargaIncoterm, contexto: ContextoPassoCarga): string | null {
  const fcl = contexto.modal_frete === 'MARITIMO' && contexto.modalidade === 'FCL'
  if (fcl) {
    const linhas = carga.linhas_container_fcl
      .filter((l) => l.tipo_container.trim() && l.quantidade > 0)
      .map((l) => `${l.quantidade}× ${l.tipo_container}`)
    return linhas.length ? linhas.join(', ') : null
  }
  if (!carga.tipo_volume) return null
  return ROTULO_VOLUME[carga.tipo_volume] || carga.tipo_volume
}

type ConteudoPassoResumoSimuladorProps = {
  modalOperacao: EstadoModalOperacaoResumo
  locais: EstadoOrigemDestino
  carga: EstadoCargaIncoterm
  contextoCarga: ContextoPassoCarga
  visibilidade: EstadoVisibilidade
  sucesso?: boolean
}

export function ConteudoPassoResumoSimulador({
  modalOperacao,
  locais,
  carga,
  contextoCarga,
  visibilidade,
  sucesso = false,
}: ConteudoPassoResumoSimuladorProps) {
  if (sucesso) {
    return (
      <div className="nc-root nc-step-wrapper nc-fade-in">
        <div className="nc-step-content">
          <div className="nc-resumo-sucesso">
            <div className="nc-resumo-sucesso-banner" role="status">
              <CheckCircle weight="fill" size={20} color="var(--success, #22c55e)" />
              <p className="nc-resumo-sucesso-banner__texto">
                <strong>Simulação criada</strong>
                Siga as próximas etapas estruturadas na sequência deste guia.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const origem = resolverTextoLocalResumo(locais.origem, modalOperacao.modal_frete)
  const destino = resolverTextoLocalResumo(locais.destino, modalOperacao.modal_frete)
  const cubagem = textoCubagem(carga)
  const tipoVolume = textoTipoVolume(carga, contextoCarga)
  const prazo = visibilidade.data_prazo
    ? `${formatarDataBr(visibilidade.data_prazo)}${visibilidade.hora_prazo ? `, ${visibilidade.hora_prazo}` : ''}`
    : ''
  const IconeModal =
    modalOperacao.modal_frete === 'AEREO'
      ? AirplaneTilt
      : modalOperacao.modal_frete === 'MARITIMO'
        ? Anchor
        : Truck

  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content">
        <SimuladorNcSectionTitle icone={<FileText {...ICONE_LABEL_SECAO} />}>
          Resumo da cotação
        </SimuladorNcSectionTitle>

        <div className="nc-receipt-card">
          <div className="nc-receipt-header">
            <span className="nc-receipt-badge">{rotuloOperacao(modalOperacao.tipo_operacao)}</span>
            <span className="nc-receipt-modal">
              {rotuloModal(modalOperacao.modal_frete, modalOperacao.modalidade)}
            </span>
          </div>

          <div className="nc-route-timeline">
            <div className="nc-timeline-node">
              <div className="nc-node-dot nc-node-dot--origin" />
              <div className="nc-node-text">
                <span className="nc-node-code">{origem.titulo}</span>
                <span className="nc-node-name">{origem.detalhe}</span>
              </div>
            </div>
            <div className="nc-timeline-line">
              <div className="nc-timeline-icon-wrap">
                <IconeModal weight="duotone" size={16} />
              </div>
              <div className="nc-timeline-line-fill" />
            </div>
            <div className="nc-timeline-node">
              <div className="nc-node-dot nc-node-dot--destination" />
              <div className="nc-node-text">
                <span className="nc-node-code">{destino.titulo}</span>
                <span className="nc-node-name">{destino.detalhe}</span>
              </div>
            </div>
          </div>

          <div className="nc-receipt-details">
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><Hash size={14} />Nº da Cotação</span>
              <span className="nc-receipt-value font-mono">{modalOperacao.numero_cotacao || '—'}</span>
            </div>
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><Package size={14} />Mercadoria</span>
              <span className="nc-receipt-value">{carga.descricao_mercadoria.trim() || '—'}</span>
            </div>
            {carga.ncm ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Barcode size={14} />NCM</span>
                <span className="nc-receipt-value">{carga.ncm}</span>
              </div>
            ) : null}
            {carga.hs_code ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Hash size={14} />HS Code</span>
                <span className="nc-receipt-value">{carga.hs_code}</span>
              </div>
            ) : null}
            {modalOperacao.carga_perigosa ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Warning size={14} />Carga perigosa</span>
                <span className="nc-receipt-value">
                  {[carga.numero_onu && `ONU ${carga.numero_onu}`, carga.classe_dg && `Classe ${carga.classe_dg}`]
                    .filter(Boolean)
                    .join(' · ') || 'Sim'}
                </span>
              </div>
            ) : null}
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><Scales size={14} />Quantidade de Volumes / Peso</span>
              <span className="nc-receipt-value">{textoQuantidadePeso(carga, contextoCarga)}</span>
            </div>
            {cubagem ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Ruler size={14} />Cubagem</span>
                <span className="nc-receipt-value">{cubagem}</span>
              </div>
            ) : null}
            {tipoVolume ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label">
                  <ShippingContainer size={14} />
                  {contextoCarga.modal_frete === 'MARITIMO' && contextoCarga.modalidade === 'FCL'
                    ? 'Containers'
                    : 'Tipo de volume'}
                </span>
                <span className="nc-receipt-value">{tipoVolume}</span>
              </div>
            ) : null}
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><Tag size={14} />Incoterm</span>
              <span className="nc-receipt-value nc-receipt-value--incoterm">{carga.incoterm || '—'}</span>
            </div>
            {carga.valor_alvo ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Hash size={14} />Valor alvo</span>
                <span className="nc-receipt-value">
                  {[carga.moeda_alvo, carga.valor_alvo].filter(Boolean).join(' ')}
                </span>
              </div>
            ) : null}
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><Eye size={14} />Visibilidade</span>
              <span className="nc-receipt-value">{textoVisibilidade(visibilidade)}</span>
            </div>
            {visibilidade.tipo_visibilidade === 'DIRECIONADA' && visibilidade.ids_fornecedores.length > 0 ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><Buildings size={14} />Fornecedores selecionados</span>
                <span className="nc-receipt-value">{visibilidade.ids_fornecedores.length}</span>
              </div>
            ) : null}
            {prazo ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><CalendarBlank size={14} />Prazo para respostas</span>
                <span className="nc-receipt-value">{prazo}</span>
              </div>
            ) : null}
            {visibilidade.fornecedor_pode_alterar ? (
              <div className="nc-receipt-row">
                <span className="nc-receipt-label"><NotePencil size={14} />Fornecedor pode alterar proposta</span>
                <span className="nc-receipt-value">
                  {visibilidade.fornecedor_pode_alterar === 'sim' ? 'Sim' : 'Não'}
                </span>
              </div>
            ) : null}
            <div className="nc-receipt-row">
              <span className="nc-receipt-label">
                <CurrencyCircleDollar size={14} />
                Taxa de fechamento paga por
              </span>
              <span className="nc-receipt-value">Contratante Gravity</span>
            </div>
            <div className="nc-receipt-row">
              <span className="nc-receipt-label"><PaperPlaneTilt size={14} />Canais de disparo</span>
              <span className="nc-receipt-value">{textoCanais(visibilidade)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
