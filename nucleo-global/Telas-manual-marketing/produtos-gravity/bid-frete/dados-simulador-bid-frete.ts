/**
 * dados-simulador-bid-frete.ts — Fonte única de dados do simulador de marketing
 * do BID Frete Internacional. Espelha o domínio real (types.ts + status-config
 * do produto) com cotações mock por workspace, agregadas conforme o escopo.
 */

import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import type {
  MapaPedidoEmpresaSimulador,
  PinMapaSimuladorPedido,
  RotaMapaSimuladorPedido,
} from '../pedido/dados-mapa-globo-simulador-pedido'
import type {
  MetadadosRotaRefinarMapaSimuladorPedido,
  OpcoesRefinarMapaSimuladorPedido,
} from '../pedido/dados-refinar-mapa-simulador-pedido'
import type {
  AlertaPedidoSimulador,
  DistribuicaoOperacaoPedidoSimulador,
  FunilPedidoSimulador,
  IncotermPedidoSimulador,
  PedidoMesSimulador,
  TaxaAprovacaoPedidoSimulador,
} from '../pedido/dados-insights-simulador-pedido'

// ─── Domínio (paridade com o produto real) ───────────────────────────────────

export type StatusCotacaoSimuladorBidFrete =
  | 'RASCUNHO'
  | 'ENVIADA_FORNECEDORES'
  | 'EM_COTACAO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADA'
  | 'REPROVADA'

export type ModalSimuladorBidFrete = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'

export type OperacaoSimuladorBidFrete = 'IMPORTACAO' | 'EXPORTACAO'

/** Rótulos e cores oficiais — espelham status-config-bid-frete-internacional.ts */
export const STATUS_SIMULADOR_BID_FRETE: Record<
  StatusCotacaoSimuladorBidFrete,
  { rotulo: string; cor: string; ordem: number }
> = {
  RASCUNHO: { rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1 },
  ENVIADA_FORNECEDORES: { rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2 },
  EM_COTACAO: { rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3 },
  AGUARDANDO_APROVACAO: { rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4 },
  APROVADA: { rotulo: 'Aprovada', cor: '#10b981', ordem: 5 },
  REPROVADA: { rotulo: 'Reprovada', cor: '#ef4444', ordem: 6 },
}

export const MODAL_SIMULADOR_BID_FRETE: Record<
  ModalSimuladorBidFrete,
  { rotulo: string; cor: string }
> = {
  MARITIMO: { rotulo: 'Marítimo', cor: '#60a5fa' },
  AEREO: { rotulo: 'Aéreo', cor: '#c084fc' },
  RODOVIARIO: { rotulo: 'Rodoviário', cor: '#fbbf24' },
}

export const OPERACAO_SIMULADOR_BID_FRETE: Record<OperacaoSimuladorBidFrete, string> = {
  IMPORTACAO: 'Importação',
  EXPORTACAO: 'Exportação',
}

/** Títulos exatos dos KPIs — paridade com o produto real. */
export const TITULO_KPI_AGUARDANDO_APROVACAO_BID_FRETE = 'Cotações aguardando aprovação'
export const TITULO_KPI_AGUARDANDO_RESPOSTA_BID_FRETE = 'Cotações aguardando resposta'
export const TITULO_KPI_TEMPO_MEDIO_RESPOSTA_BID_FRETE = 'Tempo Médio de Resposta'

// ─── Portos / Aeroportos ─────────────────────────────────────────────────────

export type PortoSimuladorBidFrete = {
  codigo: string
  cidade: string
  pais: string
  flag: string
  lat: number
  lng: number
}

const PORTOS: Record<string, PortoSimuladorBidFrete> = {
  BRSSZ: { codigo: 'BRSSZ', cidade: 'Santos', pais: 'BR', flag: '🇧🇷', lat: -23.96, lng: -46.33 },
  BRPNG: { codigo: 'BRPNG', cidade: 'Paranaguá', pais: 'BR', flag: '🇧🇷', lat: -25.52, lng: -48.51 },
  BRNVT: { codigo: 'BRNVT', cidade: 'Navegantes', pais: 'BR', flag: '🇧🇷', lat: -26.9, lng: -48.65 },
  BRITJ: { codigo: 'BRITJ', cidade: 'Itajaí', pais: 'BR', flag: '🇧🇷', lat: -26.91, lng: -48.66 },
  BRGRU: { codigo: 'BRGRU', cidade: 'Guarulhos', pais: 'BR', flag: '🇧🇷', lat: -23.43, lng: -46.47 },
  CNSHA: { codigo: 'CNSHA', cidade: 'Shanghai', pais: 'CN', flag: '🇨🇳', lat: 31.23, lng: 121.47 },
  CNSZX: { codigo: 'CNSZX', cidade: 'Shenzhen', pais: 'CN', flag: '🇨🇳', lat: 22.54, lng: 114.06 },
  CNNGB: { codigo: 'CNNGB', cidade: 'Ningbo', pais: 'CN', flag: '🇨🇳', lat: 29.87, lng: 121.54 },
  CNPVG: { codigo: 'CNPVG', cidade: 'Shanghai Pudong', pais: 'CN', flag: '🇨🇳', lat: 31.14, lng: 121.8 },
  NLRTM: { codigo: 'NLRTM', cidade: 'Rotterdam', pais: 'NL', flag: '🇳🇱', lat: 51.92, lng: 4.48 },
  DEHAM: { codigo: 'DEHAM', cidade: 'Hamburgo', pais: 'DE', flag: '🇩🇪', lat: 53.55, lng: 9.99 },
  DEFRA: { codigo: 'DEFRA', cidade: 'Frankfurt', pais: 'DE', flag: '🇩🇪', lat: 50.03, lng: 8.56 },
  BEANR: { codigo: 'BEANR', cidade: 'Antuérpia', pais: 'BE', flag: '🇧🇪', lat: 51.22, lng: 4.4 },
  USNYC: { codigo: 'USNYC', cidade: 'Nova York', pais: 'US', flag: '🇺🇸', lat: 40.71, lng: -74.01 },
  USMIA: { codigo: 'USMIA', cidade: 'Miami', pais: 'US', flag: '🇺🇸', lat: 25.76, lng: -80.19 },
  ARBUE: { codigo: 'ARBUE', cidade: 'Buenos Aires', pais: 'AR', flag: '🇦🇷', lat: -34.6, lng: -58.38 },
  CLSCL: { codigo: 'CLSCL', cidade: 'Santiago', pais: 'CL', flag: '🇨🇱', lat: -33.45, lng: -70.67 },
}

/** Catálogo de portos/aeroportos exposto ao wizard de Nova Cotação do simulador. */
export const PORTOS_SIMULADOR_BID_FRETE: PortoSimuladorBidFrete[] = Object.values(PORTOS)

// ─── Cotação ─────────────────────────────────────────────────────────────────

export type CotacaoSimuladorBidFrete = {
  id: string
  numero: string
  /** Número do BID pai, quando a cotação faz parte de um BID (agrupada na Lista). */
  bidNumero?: string
  empresaId: string
  operacao: OperacaoSimuladorBidFrete
  modal: ModalSimuladorBidFrete
  modalidade: 'FCL' | 'LCL' | 'Aéreo Geral' | 'FTL' | 'LTL'
  origem: PortoSimuladorBidFrete
  destino: PortoSimuladorBidFrete
  incoterm: string
  equipamento: string
  valorMetaUsd: number
  melhorLanceUsd: number | null
  fornecedorLider: string | null
  propostasRecebidas: number
  fornecedoresConvidados: number
  status: StatusCotacaoSimuladorBidFrete
  dataCriacao: string
  dataLimiteResposta: string
  transitTimeDias: number | null
}

type CotacaoBase = Omit<CotacaoSimuladorBidFrete, 'id' | 'empresaId' | 'origem' | 'destino'> & {
  origem: keyof typeof PORTOS
  destino: keyof typeof PORTOS
}

function cotacao(empresaId: string, seq: number, base: CotacaoBase): CotacaoSimuladorBidFrete {
  return {
    ...base,
    id: `${empresaId}-${seq}`,
    empresaId,
    origem: PORTOS[base.origem],
    destino: PORTOS[base.destino],
  }
}

const COTACOES_POR_EMPRESA: Record<string, CotacaoSimuladorBidFrete[]> = {
  'filial-sc-importador': [
    cotacao('filial-sc-importador', 1, {
      numero: 'COT-20260708-0148', bidNumero: 'BID-2026-0045', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'CNSHA', destino: 'BRNVT', incoterm: 'FOB', equipamento: "40' High Cube ×2",
      valorMetaUsd: 14200, melhorLanceUsd: 12400, fornecedorLider: 'Hapag-Lloyd',
      propostasRecebidas: 5, fornecedoresConvidados: 8, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-08', dataLimiteResposta: '2026-07-18', transitTimeDias: 34,
    }),
    cotacao('filial-sc-importador', 2, {
      numero: 'COT-20260706-0147', bidNumero: 'BID-2026-0045', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'CNSZX', destino: 'BRITJ', incoterm: 'FOB', equipamento: "40' Dry ×1",
      valorMetaUsd: 6800, melhorLanceUsd: 6150, fornecedorLider: 'Maersk',
      propostasRecebidas: 4, fornecedoresConvidados: 6, status: 'EM_COTACAO',
      dataCriacao: '2026-07-06', dataLimiteResposta: '2026-07-20', transitTimeDias: 36,
    }),
    cotacao('filial-sc-importador', 3, {
      numero: 'COT-20260624-0139', operacao: 'IMPORTACAO', modal: 'AEREO', modalidade: 'Aéreo Geral',
      origem: 'CNPVG', destino: 'BRGRU', incoterm: 'FCA', equipamento: '480 kg · 2,1 m³',
      valorMetaUsd: 3900, melhorLanceUsd: 3420, fornecedorLider: 'Kuehne+Nagel',
      propostasRecebidas: 6, fornecedoresConvidados: 7, status: 'APROVADA',
      dataCriacao: '2026-06-24', dataLimiteResposta: '2026-07-02', transitTimeDias: 4,
    }),
    cotacao('filial-sc-importador', 4, {
      numero: 'COT-20260714-0152', bidNumero: 'BID-2026-0045', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'LCL',
      origem: 'CNNGB', destino: 'BRNVT', incoterm: 'FOB', equipamento: '8,4 m³ · 1.900 kg',
      valorMetaUsd: 2100, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 0, fornecedoresConvidados: 5, status: 'ENVIADA_FORNECEDORES',
      dataCriacao: '2026-07-14', dataLimiteResposta: '2026-07-24', transitTimeDias: null,
    }),
    cotacao('filial-sc-importador', 5, {
      numero: 'COT-20260716-0154', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'CNSHA', destino: 'BRITJ', incoterm: 'CIF', equipamento: "20' Dry ×3",
      valorMetaUsd: 9600, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 0, fornecedoresConvidados: 0, status: 'RASCUNHO',
      dataCriacao: '2026-07-16', dataLimiteResposta: '2026-07-30', transitTimeDias: null,
    }),
    cotacao('filial-sc-importador', 6, {
      numero: 'COT-20260612-0131', operacao: 'IMPORTACAO', modal: 'AEREO', modalidade: 'Aéreo Geral',
      origem: 'DEFRA', destino: 'BRGRU', incoterm: 'EXW', equipamento: '120 kg · 0,8 m³',
      valorMetaUsd: 1450, melhorLanceUsd: 1580, fornecedorLider: 'DHL Global',
      propostasRecebidas: 3, fornecedoresConvidados: 5, status: 'REPROVADA',
      dataCriacao: '2026-06-12', dataLimiteResposta: '2026-06-20', transitTimeDias: 3,
    }),
  ],
  'matriz-sp-importador': [
    cotacao('matriz-sp-importador', 1, {
      numero: 'COT-20260705-0921', bidNumero: 'BID-2026-0102', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'NLRTM', destino: 'BRSSZ', incoterm: 'FOB', equipamento: "40' High Cube ×4",
      valorMetaUsd: 22800, melhorLanceUsd: 19850, fornecedorLider: 'MSC',
      propostasRecebidas: 7, fornecedoresConvidados: 9, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-05', dataLimiteResposta: '2026-07-17', transitTimeDias: 22,
    }),
    cotacao('matriz-sp-importador', 2, {
      numero: 'COT-20260703-0918', bidNumero: 'BID-2026-0102', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'DEHAM', destino: 'BRSSZ', incoterm: 'FCA', equipamento: "40' Dry ×2",
      valorMetaUsd: 11400, melhorLanceUsd: 10200, fornecedorLider: 'Hapag-Lloyd',
      propostasRecebidas: 5, fornecedoresConvidados: 8, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-03', dataLimiteResposta: '2026-07-16', transitTimeDias: 24,
    }),
    cotacao('matriz-sp-importador', 3, {
      numero: 'COT-20260710-0925', operacao: 'IMPORTACAO', modal: 'AEREO', modalidade: 'Aéreo Geral',
      origem: 'DEFRA', destino: 'BRGRU', incoterm: 'FCA', equipamento: '820 kg · 3,6 m³',
      valorMetaUsd: 6200, melhorLanceUsd: 5480, fornecedorLider: 'Lufthansa Cargo',
      propostasRecebidas: 4, fornecedoresConvidados: 6, status: 'EM_COTACAO',
      dataCriacao: '2026-07-10', dataLimiteResposta: '2026-07-21', transitTimeDias: 2,
    }),
    cotacao('matriz-sp-importador', 4, {
      numero: 'COT-20260618-0913', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'BEANR', destino: 'BRSSZ', incoterm: 'FOB', equipamento: "20' Dry ×2",
      valorMetaUsd: 7800, melhorLanceUsd: 6900, fornecedorLider: 'CMA CGM',
      propostasRecebidas: 6, fornecedoresConvidados: 7, status: 'APROVADA',
      dataCriacao: '2026-06-18', dataLimiteResposta: '2026-06-30', transitTimeDias: 23,
    }),
    cotacao('matriz-sp-importador', 5, {
      numero: 'COT-20260713-0928', bidNumero: 'BID-2026-0102', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'LCL',
      origem: 'NLRTM', destino: 'BRSSZ', incoterm: 'FOB', equipamento: '12,2 m³ · 3.400 kg',
      valorMetaUsd: 3200, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 1, fornecedoresConvidados: 6, status: 'ENVIADA_FORNECEDORES',
      dataCriacao: '2026-07-13', dataLimiteResposta: '2026-07-23', transitTimeDias: null,
    }),
    cotacao('matriz-sp-importador', 6, {
      numero: 'COT-20260717-0930', operacao: 'IMPORTACAO', modal: 'RODOVIARIO', modalidade: 'FTL',
      origem: 'ARBUE', destino: 'BRSSZ', incoterm: 'DAP', equipamento: 'Carreta LS ×1',
      valorMetaUsd: 4600, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 0, fornecedoresConvidados: 0, status: 'RASCUNHO',
      dataCriacao: '2026-07-17', dataLimiteResposta: '2026-07-28', transitTimeDias: null,
    }),
  ],
  'filial-pr-exportador': [
    cotacao('filial-pr-exportador', 1, {
      numero: 'COT-20260707-0442', bidNumero: 'BID-2026-0087', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'BRPNG', destino: 'USNYC', incoterm: 'CIF', equipamento: "40' Reefer ×3",
      valorMetaUsd: 18600, melhorLanceUsd: 16750, fornecedorLider: 'Maersk',
      propostasRecebidas: 5, fornecedoresConvidados: 7, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-07', dataLimiteResposta: '2026-07-18', transitTimeDias: 18,
    }),
    cotacao('filial-pr-exportador', 2, {
      numero: 'COT-20260620-0440', bidNumero: 'BID-2026-0087', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'BRPNG', destino: 'NLRTM', incoterm: 'FOB', equipamento: "40' High Cube ×2",
      valorMetaUsd: 9800, melhorLanceUsd: 8640, fornecedorLider: 'CMA CGM',
      propostasRecebidas: 6, fornecedoresConvidados: 8, status: 'APROVADA',
      dataCriacao: '2026-06-20', dataLimiteResposta: '2026-07-01', transitTimeDias: 21,
    }),
    cotacao('filial-pr-exportador', 3, {
      numero: 'COT-20260711-0447', operacao: 'EXPORTACAO', modal: 'RODOVIARIO', modalidade: 'FTL',
      origem: 'BRPNG', destino: 'ARBUE', incoterm: 'DAP', equipamento: 'Carreta Sider ×2',
      valorMetaUsd: 5200, melhorLanceUsd: 4780, fornecedorLider: 'Transpo Sul',
      propostasRecebidas: 3, fornecedoresConvidados: 5, status: 'EM_COTACAO',
      dataCriacao: '2026-07-11', dataLimiteResposta: '2026-07-22', transitTimeDias: 6,
    }),
    cotacao('filial-pr-exportador', 4, {
      numero: 'COT-20260715-0449', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'LCL',
      origem: 'BRPNG', destino: 'CLSCL', incoterm: 'CFR', equipamento: '6,8 m³ · 1.450 kg',
      valorMetaUsd: 1900, melhorLanceUsd: 1280, fornecedorLider: 'Task Agente Ltda',
      propostasRecebidas: 3, fornecedoresConvidados: 4, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-15', dataLimiteResposta: '2026-07-25', transitTimeDias: 20,
    }),
    cotacao('filial-pr-exportador', 5, {
      numero: 'COT-20260716-0450', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'LCL',
      origem: 'BRSSZ', destino: 'USMIA', incoterm: 'FOB', equipamento: '5,2 m³ · 1.100 kg',
      valorMetaUsd: 1750, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 0, fornecedoresConvidados: 4, status: 'ENVIADA_FORNECEDORES',
      dataCriacao: '2026-07-16', dataLimiteResposta: '2026-07-26', transitTimeDias: null,
    }),
  ],
  'importador-ltda': [
    cotacao('importador-ltda', 1, {
      numero: 'COT-20260709-0731', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'DEHAM', destino: 'BRSSZ', incoterm: 'FOB', equipamento: "40' Dry ×1",
      valorMetaUsd: 5900, melhorLanceUsd: 1280, fornecedorLider: 'Task Agente Ltda',
      propostasRecebidas: 3, fornecedoresConvidados: 4, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-09', dataLimiteResposta: '2026-07-22', transitTimeDias: 20,
    }),
    cotacao('importador-ltda', 2, {
      numero: 'COT-20260626-0728', operacao: 'IMPORTACAO', modal: 'AEREO', modalidade: 'Aéreo Geral',
      origem: 'CNPVG', destino: 'BRGRU', incoterm: 'FCA', equipamento: '260 kg · 1,4 m³',
      valorMetaUsd: 2700, melhorLanceUsd: 2380, fornecedorLider: 'Emirates SkyCargo',
      propostasRecebidas: 5, fornecedoresConvidados: 6, status: 'APROVADA',
      dataCriacao: '2026-06-26', dataLimiteResposta: '2026-07-05', transitTimeDias: 5,
    }),
    cotacao('importador-ltda', 3, {
      numero: 'COT-20260712-0735', operacao: 'IMPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'CNNGB', destino: 'BRSSZ', incoterm: 'FOB', equipamento: "20' Dry ×2",
      valorMetaUsd: 8400, melhorLanceUsd: 7860, fornecedorLider: 'COSCO',
      propostasRecebidas: 3, fornecedoresConvidados: 7, status: 'EM_COTACAO',
      dataCriacao: '2026-07-12', dataLimiteResposta: '2026-07-23', transitTimeDias: 33,
    }),
  ],
  'exportador-ltda': [
    cotacao('exportador-ltda', 1, {
      numero: 'COT-20260706-0311', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'BRSSZ', destino: 'USMIA', incoterm: 'CIF', equipamento: "40' High Cube ×2",
      valorMetaUsd: 8900, melhorLanceUsd: 7950, fornecedorLider: 'MSC',
      propostasRecebidas: 5, fornecedoresConvidados: 7, status: 'AGUARDANDO_APROVACAO',
      dataCriacao: '2026-07-06', dataLimiteResposta: '2026-07-17', transitTimeDias: 14,
    }),
    cotacao('exportador-ltda', 2, {
      numero: 'COT-20260615-0308', operacao: 'EXPORTACAO', modal: 'MARITIMO', modalidade: 'FCL',
      origem: 'BRSSZ', destino: 'NLRTM', incoterm: 'FOB', equipamento: "20' Dry ×4",
      valorMetaUsd: 12600, melhorLanceUsd: 11480, fornecedorLider: 'Maersk',
      propostasRecebidas: 6, fornecedoresConvidados: 8, status: 'APROVADA',
      dataCriacao: '2026-06-15', dataLimiteResposta: '2026-06-28', transitTimeDias: 20,
    }),
    cotacao('exportador-ltda', 3, {
      numero: 'COT-20260714-0315', operacao: 'EXPORTACAO', modal: 'AEREO', modalidade: 'Aéreo Geral',
      origem: 'BRGRU', destino: 'USMIA', incoterm: 'FCA', equipamento: '340 kg · 1,9 m³',
      valorMetaUsd: 2400, melhorLanceUsd: null, fornecedorLider: null,
      propostasRecebidas: 1, fornecedoresConvidados: 5, status: 'ENVIADA_FORNECEDORES',
      dataCriacao: '2026-07-14', dataLimiteResposta: '2026-07-24', transitTimeDias: null,
    }),
  ],
}

const EMPRESA_FALLBACK = 'filial-sc-importador'

export function listarCotacoesEmpresasSimuladorBidFrete(
  empresas: PerfilEmpresaSimulador[],
): CotacaoSimuladorBidFrete[] {
  const ids = empresas.map((e) => e.id).filter((id) => COTACOES_POR_EMPRESA[id])
  const efetivos = ids.length > 0 ? ids : [EMPRESA_FALLBACK]
  return efetivos.flatMap((id) => COTACOES_POR_EMPRESA[id])
}

// ─── Hierarquia da Lista: BID (pai) → cotações (filhas) ──────────────────────
// Como no produto real: BID sempre tem cotações dentro; cotação avulsa
// (sem bidNumero) é linha plana sem expandir.

export type BidGrupoSimuladorBidFrete = {
  tipo: 'bid'
  id: string
  numero: string
  quantidadeCotacoes: number
  cotacoes: CotacaoSimuladorBidFrete[]
}

export type LinhaPaiListaSimuladorBidFrete = CotacaoSimuladorBidFrete | BidGrupoSimuladorBidFrete

export function isBidGrupoSimuladorBidFrete(
  linha: LinhaPaiListaSimuladorBidFrete,
): linha is BidGrupoSimuladorBidFrete {
  return 'tipo' in linha && linha.tipo === 'bid'
}

/**
 * Agrupa cotações com bidNumero em linhas de BID (pai) preservando a ordem de
 * chegada; cotações sem bidNumero permanecem avulsas no nível raiz.
 */
export function agruparLinhasPaiListaSimuladorBidFrete(
  cotacoes: CotacaoSimuladorBidFrete[],
): LinhaPaiListaSimuladorBidFrete[] {
  const linhas: LinhaPaiListaSimuladorBidFrete[] = []
  const bidsPorNumero = new Map<string, BidGrupoSimuladorBidFrete>()
  for (const cotacao of cotacoes) {
    if (!cotacao.bidNumero) {
      linhas.push(cotacao)
      continue
    }
    let bid = bidsPorNumero.get(cotacao.bidNumero)
    if (!bid) {
      bid = {
        tipo: 'bid',
        id: `bid:${cotacao.bidNumero}`,
        numero: cotacao.bidNumero,
        quantidadeCotacoes: 0,
        cotacoes: [],
      }
      bidsPorNumero.set(cotacao.bidNumero, bid)
      linhas.push(bid)
    }
    bid.cotacoes.push(cotacao)
    bid.quantidadeCotacoes = bid.cotacoes.length
  }
  return linhas
}

// ─── Formatação ──────────────────────────────────────────────────────────────

export function formatarUsdSimuladorBidFrete(valor: number): string {
  return `USD ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatarDataCurtaSimuladorBidFrete(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function savingsCotacaoSimuladorBidFrete(cotacao: CotacaoSimuladorBidFrete): number | null {
  if (cotacao.melhorLanceUsd == null) return null
  return cotacao.valorMetaUsd - cotacao.melhorLanceUsd
}

// ─── Insights agregados ──────────────────────────────────────────────────────

export type LinhaTooltipKpiBidFrete = { rotulo: string; valor: string; cor?: string }

export type CotacaoMesSimuladorBidFrete = PedidoMesSimulador

export type PtaxSimuladorBidFrete = {
  moeda: string
  nome: string
  valor: string
  variacao: number
}

export type MelhorNegociacaoSimuladorBidFrete = {
  numero: string
  rota: string
  fornecedor: string
  savingsUsd: number
  savingsPct: number
  lanceUsd: number
}

export type RankingFornecedorSimuladorBidFrete = {
  nome: string
  propostas: number
  vitorias: number
  savingsUsd: number
}

export type InsightsEscopoSimuladorBidFrete = {
  totalCotacoes: number
  aguardandoAprovacao: {
    count: number
    volumeAbertoUsd: number
    cotacoes: CotacaoSimuladorBidFrete[]
  }
  aguardandoResposta: {
    count: number
    enviadas: number
    emCotacao: number
    volumeMetaUsd: number
    cotacoes: CotacaoSimuladorBidFrete[]
  }
  tempoMedioRespostaDias: number
  funil: FunilPedidoSimulador[]
  alertas: AlertaPedidoSimulador[]
  cotacoesPorMes: CotacaoMesSimuladorBidFrete[]
  distribuicaoModal: DistribuicaoOperacaoPedidoSimulador[]
  incoterms: IncotermPedidoSimulador[]
  taxaAprovacao: TaxaAprovacaoPedidoSimulador
  melhorNegociacao: MelhorNegociacaoSimuladorBidFrete | null
  ptax: PtaxSimuladorBidFrete[]
  rankingFornecedores: RankingFornecedorSimuladorBidFrete[]
}

/** Série mensal por empresa (Fev–Jul/2026) — somada conforme o escopo. */
const MESES_POR_EMPRESA: Record<string, CotacaoMesSimuladorBidFrete[]> = {
  'filial-sc-importador': [
    { mes: 'Fev', total: 6, aprovadas: 4, emAndamento: 1, recusadas: 1 },
    { mes: 'Mar', total: 8, aprovadas: 5, emAndamento: 2, recusadas: 1 },
    { mes: 'Abr', total: 7, aprovadas: 5, emAndamento: 2, recusadas: 0 },
    { mes: 'Mai', total: 9, aprovadas: 6, emAndamento: 2, recusadas: 1 },
    { mes: 'Jun', total: 8, aprovadas: 5, emAndamento: 2, recusadas: 1 },
    { mes: 'Jul', total: 6, aprovadas: 2, emAndamento: 4, recusadas: 0 },
  ],
  'matriz-sp-importador': [
    { mes: 'Fev', total: 9, aprovadas: 6, emAndamento: 2, recusadas: 1 },
    { mes: 'Mar', total: 11, aprovadas: 8, emAndamento: 2, recusadas: 1 },
    { mes: 'Abr', total: 10, aprovadas: 7, emAndamento: 2, recusadas: 1 },
    { mes: 'Mai', total: 12, aprovadas: 8, emAndamento: 3, recusadas: 1 },
    { mes: 'Jun', total: 11, aprovadas: 7, emAndamento: 3, recusadas: 1 },
    { mes: 'Jul', total: 6, aprovadas: 1, emAndamento: 5, recusadas: 0 },
  ],
  'filial-pr-exportador': [
    { mes: 'Fev', total: 4, aprovadas: 3, emAndamento: 1, recusadas: 0 },
    { mes: 'Mar', total: 5, aprovadas: 3, emAndamento: 1, recusadas: 1 },
    { mes: 'Abr', total: 5, aprovadas: 4, emAndamento: 1, recusadas: 0 },
    { mes: 'Mai', total: 6, aprovadas: 4, emAndamento: 2, recusadas: 0 },
    { mes: 'Jun', total: 5, aprovadas: 3, emAndamento: 1, recusadas: 1 },
    { mes: 'Jul', total: 4, aprovadas: 1, emAndamento: 3, recusadas: 0 },
  ],
  'importador-ltda': [
    { mes: 'Fev', total: 3, aprovadas: 2, emAndamento: 1, recusadas: 0 },
    { mes: 'Mar', total: 4, aprovadas: 3, emAndamento: 1, recusadas: 0 },
    { mes: 'Abr', total: 3, aprovadas: 2, emAndamento: 1, recusadas: 0 },
    { mes: 'Mai', total: 4, aprovadas: 3, emAndamento: 1, recusadas: 0 },
    { mes: 'Jun', total: 4, aprovadas: 2, emAndamento: 1, recusadas: 1 },
    { mes: 'Jul', total: 3, aprovadas: 1, emAndamento: 2, recusadas: 0 },
  ],
  'exportador-ltda': [
    { mes: 'Fev', total: 3, aprovadas: 2, emAndamento: 1, recusadas: 0 },
    { mes: 'Mar', total: 3, aprovadas: 2, emAndamento: 0, recusadas: 1 },
    { mes: 'Abr', total: 4, aprovadas: 3, emAndamento: 1, recusadas: 0 },
    { mes: 'Mai', total: 4, aprovadas: 3, emAndamento: 1, recusadas: 0 },
    { mes: 'Jun', total: 3, aprovadas: 2, emAndamento: 1, recusadas: 0 },
    { mes: 'Jul', total: 3, aprovadas: 1, emAndamento: 2, recusadas: 0 },
  ],
}

const ALERTAS_POR_EMPRESA: Record<string, [number, number, number, number]> = {
  // [vence hoje, sem resposta 48h, novas propostas, aprovadas na semana]
  'filial-sc-importador': [1, 1, 3, 1],
  'matriz-sp-importador': [2, 1, 4, 1],
  'filial-pr-exportador': [1, 0, 2, 1],
  'importador-ltda': [0, 1, 1, 1],
  'exportador-ltda': [1, 0, 2, 1],
}

const PTAX_FIXO: PtaxSimuladorBidFrete[] = [
  { moeda: 'USD', nome: 'Dólar Americano', valor: 'R$ 5,4320', variacao: 0.32 },
  { moeda: 'EUR', nome: 'Euro', valor: 'R$ 5,9184', variacao: -0.18 },
  { moeda: 'CNY', nome: 'Yuan Chinês', valor: 'R$ 0,7612', variacao: 0.05 },
]

function pctDe(parte: number, total: number): number {
  if (total === 0) return 0
  return Math.round((parte / total) * 100)
}

export function agregarInsightsBidFreteEmpresasSimulador(
  empresas: PerfilEmpresaSimulador[],
): InsightsEscopoSimuladorBidFrete {
  const cotacoes = listarCotacoesEmpresasSimuladorBidFrete(empresas)
  const idsEfetivos = new Set(cotacoes.map((c) => c.empresaId))

  const aguardandoAprovacaoCotacoes = cotacoes.filter((c) => c.status === 'AGUARDANDO_APROVACAO')
  const enviadas = cotacoes.filter((c) => c.status === 'ENVIADA_FORNECEDORES')
  const emCotacao = cotacoes.filter((c) => c.status === 'EM_COTACAO')
  const aguardandoRespostaCotacoes = [...enviadas, ...emCotacao]

  const ordemStatus: StatusCotacaoSimuladorBidFrete[] = [
    'RASCUNHO',
    'ENVIADA_FORNECEDORES',
    'EM_COTACAO',
    'AGUARDANDO_APROVACAO',
    'APROVADA',
  ]
  const funil: FunilPedidoSimulador[] = ordemStatus.map((status) => {
    const count = cotacoes.filter((c) => c.status === status).length
    return {
      rotulo: STATUS_SIMULADOR_BID_FRETE[status].rotulo,
      cor: STATUS_SIMULADOR_BID_FRETE[status].cor,
      count,
      pct: pctDe(count, cotacoes.length),
    }
  })

  const somaAlertas: [number, number, number, number] = [0, 0, 0, 0]
  for (const id of idsEfetivos) {
    const alertasEmpresa = ALERTAS_POR_EMPRESA[id]
    if (!alertasEmpresa) continue
    somaAlertas[0] += alertasEmpresa[0]
    somaAlertas[1] += alertasEmpresa[1]
    somaAlertas[2] += alertasEmpresa[2]
    somaAlertas[3] += alertasEmpresa[3]
  }
  const alertas: AlertaPedidoSimulador[] = [
    { rotulo: 'Vencem hoje', valor: somaAlertas[0], cor: 'red', descricao: 'Cotações com prazo de resposta encerrando hoje' },
    { rotulo: 'Sem resposta 48h', valor: somaAlertas[1], cor: 'yellow', descricao: 'Disparos enviados há mais de 48h sem proposta' },
    { rotulo: 'Novas propostas', valor: somaAlertas[2], cor: 'green', descricao: 'Propostas de fornecedores recebidas hoje' },
    { rotulo: 'Aprovadas na semana', valor: somaAlertas[3], cor: 'orange', descricao: 'Cotações aprovadas nos últimos 7 dias' },
  ]

  const mesesBase = [...idsEfetivos]
    .map((id) => MESES_POR_EMPRESA[id])
    .filter((serie): serie is CotacaoMesSimuladorBidFrete[] => Boolean(serie))
  const cotacoesPorMes: CotacaoMesSimuladorBidFrete[] = (mesesBase[0] ?? []).map((mesRef, idx) => {
    const somar = (extrair: (m: CotacaoMesSimuladorBidFrete) => number) =>
      mesesBase.reduce((soma, serie) => soma + extrair(serie[idx]), 0)
    return {
      mes: mesRef.mes,
      total: somar((m) => m.total),
      aprovadas: somar((m) => m.aprovadas),
      emAndamento: somar((m) => m.emAndamento),
      recusadas: somar((m) => m.recusadas),
    }
  })

  const modais: ModalSimuladorBidFrete[] = ['MARITIMO', 'AEREO', 'RODOVIARIO']
  const distribuicaoModal: DistribuicaoOperacaoPedidoSimulador[] = modais
    .map((modal) => {
      const valor = cotacoes.filter((c) => c.modal === modal).length
      return {
        rotulo: MODAL_SIMULADOR_BID_FRETE[modal].rotulo,
        cor: MODAL_SIMULADOR_BID_FRETE[modal].cor,
        valor,
        pct: pctDe(valor, cotacoes.length),
      }
    })
    .filter((item) => item.valor > 0)

  const contagemIncoterm = new Map<string, number>()
  for (const c of cotacoes) {
    contagemIncoterm.set(c.incoterm, (contagemIncoterm.get(c.incoterm) ?? 0) + 1)
  }
  const incoterms: IncotermPedidoSimulador[] = [...contagemIncoterm.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([codigo, valor]) => ({ codigo, valor, pct: pctDe(valor, cotacoes.length) }))

  const aprovadas = cotacoes.filter((c) => c.status === 'APROVADA')
  const melhor = aprovadas
    .map((c) => ({ cotacao: c, savings: savingsCotacaoSimuladorBidFrete(c) ?? 0 }))
    .sort((a, b) => b.savings - a.savings)[0]
  const melhorNegociacao: MelhorNegociacaoSimuladorBidFrete | null = melhor
    ? {
        numero: melhor.cotacao.numero,
        rota: `${melhor.cotacao.origem.codigo} → ${melhor.cotacao.destino.codigo}`,
        fornecedor: melhor.cotacao.fornecedorLider ?? '—',
        savingsUsd: melhor.savings,
        savingsPct: Math.round((melhor.savings / melhor.cotacao.valorMetaUsd) * 100),
        lanceUsd: melhor.cotacao.melhorLanceUsd ?? 0,
      }
    : null

  const rankingMap = new Map<string, RankingFornecedorSimuladorBidFrete>()
  for (const c of cotacoes) {
    if (!c.fornecedorLider) continue
    const atual = rankingMap.get(c.fornecedorLider) ?? {
      nome: c.fornecedorLider,
      propostas: 0,
      vitorias: 0,
      savingsUsd: 0,
    }
    atual.propostas += c.propostasRecebidas
    if (c.status === 'APROVADA') {
      atual.vitorias += 1
      atual.savingsUsd += savingsCotacaoSimuladorBidFrete(c) ?? 0
    }
    rankingMap.set(c.fornecedorLider, atual)
  }
  const rankingFornecedores = [...rankingMap.values()]
    .sort((a, b) => b.vitorias - a.vitorias || b.propostas - a.propostas)
    .slice(0, 5)

  return {
    totalCotacoes: cotacoes.length,
    aguardandoAprovacao: {
      count: aguardandoAprovacaoCotacoes.length,
      volumeAbertoUsd: aguardandoAprovacaoCotacoes.reduce((s, c) => s + (c.melhorLanceUsd ?? 0), 0),
      cotacoes: aguardandoAprovacaoCotacoes,
    },
    aguardandoResposta: {
      count: aguardandoRespostaCotacoes.length,
      enviadas: enviadas.length,
      emCotacao: emCotacao.length,
      volumeMetaUsd: aguardandoRespostaCotacoes.reduce((s, c) => s + c.valorMetaUsd, 0),
      cotacoes: aguardandoRespostaCotacoes,
    },
    tempoMedioRespostaDias: 2.4,
    funil,
    alertas,
    cotacoesPorMes,
    distribuicaoModal,
    incoterms,
    taxaAprovacao: { emTempo: 87, atrasadas: 13, semResposta: 5 },
    melhorNegociacao,
    ptax: PTAX_FIXO,
    rankingFornecedores,
  }
}

// ─── Mapa global de cotações (reusa o motor do mapa do Pedido) ───────────────

const COR_IMPORTACAO = 'rgba(96, 165, 250, 0.8)'
const COR_EXPORTACAO = 'rgba(167, 139, 250, 0.8)'

export function montarMapaBidFreteEmpresasSimulador(
  empresas: PerfilEmpresaSimulador[],
): MapaPedidoEmpresaSimulador {
  const cotacoes = listarCotacoesEmpresasSimuladorBidFrete(empresas)

  const pinPorCodigo = new Map<string, PinMapaSimuladorPedido & { volumeUsd: number; melhorUsd: number | null }>()
  let proximoId = 1
  const idPorCodigo = new Map<string, number>()

  function garantirPin(porto: PortoSimuladorBidFrete, operacao: OperacaoSimuladorBidFrete): number {
    let id = idPorCodigo.get(porto.codigo)
    if (id == null) {
      id = proximoId++
      idPorCodigo.set(porto.codigo, id)
      pinPorCodigo.set(porto.codigo, {
        id,
        label: porto.cidade,
        country: porto.pais,
        flag: porto.flag,
        portCode: porto.codigo,
        geoLat: porto.lat,
        geoLng: porto.lng,
        tipoOperacao: operacao === 'IMPORTACAO' ? 'importacao' : 'exportacao',
        pedidosCount: 0,
        contratosCambioCount: 0,
        totalAReceber: '—',
        totalAPagar: '—',
        volumeUsd: 0,
        melhorUsd: null,
      })
    }
    return id
  }

  const rotas: RotaMapaSimuladorPedido[] = []
  const rotasVistas = new Set<string>()

  for (const c of cotacoes) {
    const operacao = c.operacao === 'IMPORTACAO' ? 'importacao' : 'exportacao'
    const fromId = garantirPin(c.origem, c.operacao)
    const toId = garantirPin(c.destino, c.operacao)

    for (const codigo of [c.origem.codigo, c.destino.codigo]) {
      const pin = pinPorCodigo.get(codigo)
      if (!pin) continue
      pin.pedidosCount += 1
      pin.contratosCambioCount += c.propostasRecebidas
      pin.volumeUsd += c.valorMetaUsd
      if (c.melhorLanceUsd != null) {
        pin.melhorUsd = pin.melhorUsd == null ? c.melhorLanceUsd : Math.min(pin.melhorUsd, c.melhorLanceUsd)
      }
      if (!pin.fornecedorPrincipal && c.fornecedorLider) pin.fornecedorPrincipal = c.fornecedorLider
    }

    const chave = `${fromId}|${toId}|${operacao}`
    if (!rotasVistas.has(chave)) {
      rotasVistas.add(chave)
      rotas.push({
        fromId,
        toId,
        mode: operacao,
        color: operacao === 'importacao' ? COR_IMPORTACAO : COR_EXPORTACAO,
        heightFactor: 0.16 + (rotas.length % 4) * 0.02,
      })
    }
  }

  const pins: PinMapaSimuladorPedido[] = [...pinPorCodigo.values()]
    .map(({ volumeUsd, melhorUsd, ...pin }) => ({
      ...pin,
      totalAReceber: melhorUsd != null ? formatarUsdSimuladorBidFrete(melhorUsd) : '—',
      totalAPagar: formatarUsdSimuladorBidFrete(volumeUsd),
    }))
    .sort((a, b) => b.pedidosCount - a.pedidosCount)

  return { pins, rotas }
}

const PAIS_NOME_BID: Record<string, string> = {
  BR: 'Brasil',
  CN: 'China',
  NL: 'Países Baixos',
  DE: 'Alemanha',
  BE: 'Bélgica',
  US: 'Estados Unidos',
  AR: 'Argentina',
  CL: 'Chile',
}

export function montarContextoRefinarMapaBidFrete(empresas: PerfilEmpresaSimulador[]): {
  mapaBase: MapaPedidoEmpresaSimulador
  metadados: Map<string, MetadadosRotaRefinarMapaSimuladorPedido>
  opcoes: OpcoesRefinarMapaSimuladorPedido
} {
  const cotacoes = listarCotacoesEmpresasSimuladorBidFrete(empresas)
  const mapaBase = montarMapaBidFreteEmpresasSimulador(empresas)
  const pinPorCodigo = new Map(mapaBase.pins.map((pin) => [pin.portCode, pin]))
  const nomeEmpresa = new Map(empresas.map((e) => [e.id, e.nome]))

  const metadados = new Map<string, MetadadosRotaRefinarMapaSimuladorPedido>()
  for (const rota of mapaBase.rotas) {
    const from = mapaBase.pins.find((p) => p.id === rota.fromId)
    const to = mapaBase.pins.find((p) => p.id === rota.toId)
    if (!from || !to) continue
    const cotacaoRota = cotacoes.find(
      (c) =>
        pinPorCodigo.get(c.origem.codigo)?.id === rota.fromId &&
        pinPorCodigo.get(c.destino.codigo)?.id === rota.toId,
    )
    metadados.set(`${rota.fromId}|${rota.toId}|${rota.mode}`, {
      operacao: rota.mode,
      origemPais: from.country,
      destinoPais: to.country,
      exportador: cotacaoRota?.fornecedorLider ?? '—',
      importador: nomeEmpresa.get(cotacaoRota?.empresaId ?? '') ?? cotacaoRota?.empresaId ?? '—',
      status: cotacaoRota?.status ?? 'EM_COTACAO',
    })
  }

  const paises = (extrair: (rota: RotaMapaSimuladorPedido) => number) => {
    const codigos = new Set<string>()
    for (const rota of mapaBase.rotas) {
      const pin = mapaBase.pins.find((p) => p.id === extrair(rota))
      if (pin) codigos.add(pin.country)
    }
    return [...codigos]
      .map((codigo) => {
        const pin = mapaBase.pins.find((p) => p.country === codigo)
        return { codigo, nome: PAIS_NOME_BID[codigo] ?? codigo, flag: pin?.flag ?? '🏳️' }
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }

  const fornecedores = [
    ...new Set([...metadados.values()].map((m) => m.exportador).filter((n) => n !== '—')),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  const workspaces = [
    ...new Set([...metadados.values()].map((m) => m.importador).filter((n) => n !== '—')),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  const statusPresentes = [...new Set([...metadados.values()].map((m) => m.status))]
  const opcoes: OpcoesRefinarMapaSimuladorPedido = {
    operacoes: [
      { id: 'importacao', rotulo: 'Importação' },
      { id: 'exportacao', rotulo: 'Exportação' },
    ],
    origens: paises((rota) => rota.fromId),
    destinos: paises((rota) => rota.toId),
    exportadores: fornecedores,
    importadores: workspaces,
    status: (Object.keys(STATUS_SIMULADOR_BID_FRETE) as StatusCotacaoSimuladorBidFrete[])
      .filter((status) => statusPresentes.includes(status))
      .map((status) => ({
        id: status,
        rotulo: STATUS_SIMULADOR_BID_FRETE[status].rotulo,
        cor: STATUS_SIMULADOR_BID_FRETE[status].cor,
      })),
  }

  return { mapaBase, metadados, opcoes }
}
