/**
 * Incoterms — mesmos códigos e textos de apoio da Nova Cotação (Bid Frete).
 * Cópia local (isolamento entre produtos); i18n reusa chaves bidfrete.nova_cotacao.* quando existirem.
 */
import type { TFunction } from 'i18next'

export const INCOTERMS_SIMULA_CUSTO = [
  'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP',
] as const

export type IncotermSimulaCusto = (typeof INCOTERMS_SIMULA_CUSTO)[number]

const INCOTERM_SUFIXO: Record<string, string> = {
  EXW: 'Exw', FCA: 'Fca', FAS: 'Fas', FOB: 'Fob', CFR: 'Cfr', CIF: 'Cif',
  CPT: 'Cpt', CIP: 'Cip', DAP: 'Dap', DPU: 'Dpu', DDP: 'Ddp',
}

const INCOTERM_EXPLICACOES_PT: Record<string, { titulo: string; desc: string; responsabilidade: string }> = {
  EXW: {
    titulo: 'EXW — Ex Works (Na Origem)',
    desc: 'O comprador assume todos os custos e riscos a partir do estabelecimento do vendedor (coleta, porto de origem, frete internacional e taxas).',
    responsabilidade: 'Comprador assume 100% da cadeia logística.',
  },
  FCA: {
    titulo: 'FCA — Free Carrier (Franco Transportador)',
    desc: 'O vendedor realiza o desembaraço de exportação e entrega a carga no local/transportador indicado na origem pelo comprador.',
    responsabilidade: 'Vendedor desembaraça na origem; comprador assume a partir da entrega ao transportador.',
  },
  FAS: {
    titulo: 'FAS — Free Alongside Ship (Livre ao Lado do Navio)',
    desc: 'O vendedor coloca a mercadoria ao lado do navio do comprador no porto de embarque indicado. Risco passa na linha de cais.',
    responsabilidade: 'Exclusivo para modal marítimo/fluvial. Comprador contrata frete internacional.',
  },
  FOB: {
    titulo: 'FOB — Free On Board (Livre a Bordo)',
    desc: 'O vendedor entrega a carga a bordo do navio indicado pelo comprador no porto de embarque designado. O risco passa quando a carga está a bordo.',
    responsabilidade: 'Exclusivo para modal marítimo. Custos de embarque de origem com o vendedor; frete com o comprador.',
  },
  CFR: {
    titulo: 'CFR — Cost and Freight (Custo e Frete)',
    desc: 'O vendedor paga os custos e frete marítimo até o porto de destino. Os riscos de perda são transferidos ao comprador no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete pago pelo vendedor; seguro internacional é opcional do comprador.',
  },
  CIF: {
    titulo: 'CIF — Cost, Insurance and Freight (Custo, Seguro e Frete)',
    desc: 'O vendedor paga custos, frete internacional e contrata seguro marítimo até o porto de destino designado. Riscos transferem no embarque.',
    responsabilidade: 'Exclusivo para marítimo. Frete e seguro básico com o vendedor; riscos com o comprador.',
  },
  CPT: {
    titulo: 'CPT — Carriage Paid To (Transporte Pago Até)',
    desc: 'O vendedor contrata e paga o frete principal até o ponto acordado. Porém, os riscos passam ao comprador na entrega ao primeiro transportador.',
    responsabilidade: 'Custos com o vendedor; riscos de perda ou dano com o comprador durante o transporte.',
  },
  CIP: {
    titulo: 'CIP — Carriage and Insurance Paid To (Transporte e Seguro Pagos Até)',
    desc: 'Idêntico ao CPT, mas o vendedor é responsável por contratar e pagar um seguro de transporte contra perda ou dano da carga.',
    responsabilidade: 'Custos e seguro com o vendedor; riscos com o comprador a partir da origem.',
  },
  DAP: {
    titulo: 'DAP — Delivered At Place (Entregue no Local)',
    desc: 'O vendedor assume riscos e fretes até a chegada no local de destino acordado (antes da descarga). O comprador faz a importação e descarga.',
    responsabilidade: 'Vendedor assume frete internacional até o destino; comprador faz desembaraço de importação.',
  },
  DPU: {
    titulo: 'DPU — Delivered at Place Unloaded (Entregue no Local Descarregado)',
    desc: 'O vendedor entrega a mercadoria descarregada do meio de transporte no local indicado. Substitui o antigo DAT.',
    responsabilidade: 'Vendedor assume o transporte e a descarga no destino; comprador faz o desembaraço.',
  },
  DDP: {
    titulo: 'DDP — Delivered Duty Paid (Entregue com Direitos Pagos)',
    desc: 'O vendedor assume todos os custos e riscos da operação até a entrega no destino do comprador, incluindo tarifas alfandegárias de importação.',
    responsabilidade: 'Vendedor assume 100% da logística e impostos de importação.',
  },
}

export function explicacaoIncotermSimulaCusto(
  t: TFunction,
  inc: string,
): { titulo: string; desc: string; responsabilidade: string } | null {
  const sufixo = INCOTERM_SUFIXO[inc]
  const padrao = INCOTERM_EXPLICACOES_PT[inc]
  if (!sufixo || !padrao) return null
  return {
    titulo: t(`bidfrete.nova_cotacao.incoterm${sufixo}Title`, { defaultValue: padrao.titulo }),
    desc: t(`bidfrete.nova_cotacao.incoterm${sufixo}Desc`, { defaultValue: padrao.desc }),
    responsabilidade: t(`bidfrete.nova_cotacao.incoterm${sufixo}Resp`, { defaultValue: padrao.responsabilidade }),
  }
}
