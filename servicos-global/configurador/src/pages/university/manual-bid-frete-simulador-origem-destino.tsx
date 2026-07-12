import React, { useMemo, useState } from 'react'
import {
  AirplaneTilt,
  Anchor,
  Buildings,
  FileText,
  GlobeHemisphereWest,
  ListPlus,
  MapPin,
  Package,
  Plus,
  Trash,
  Truck,
  Users,
} from '@phosphor-icons/react'
import { SelectGlobal, type SelectOpcao } from '@nucleo/campo-select-global'
import {
  NC_ESTILOS_SIMULADOR_MODAL_OPERACAO,
  NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO,
} from './manual-bid-frete-estilos-nc-simulador'
import { ICONE_FIELD, SimuladorNcField } from './manual-bid-frete-simulador-nc-ui'
import { ManualBidFreteSimuladorWizardEmbutido } from './manual-bid-frete-simulador-wizard-embutido'
import { MANUAL_ESPACO_PARAGRAFO_PX } from './manual-tipografia'
import {
  ManualBidFreteGuiaAoVivo,
  type CampoGuiaAoVivo,
  type SelecaoGuiaAoVivo,
} from './manual-bid-frete-guia-ao-vivo'

export type LadoLocal = 'origem' | 'destino'

export type CampoOrigemDestinoId =
  | 'porto_origem'
  | 'portos_proximos_origem'
  | 'coleta_origem'
  | 'porto_destino'
  | 'portos_proximos_destino'
  | 'entrega_destino'

export type EstadoLadoOrigemDestino = {
  porto: string | null
  proximosHabilitado: boolean
  proximos: string[]
  extrasHabilitado: boolean
  pais: string | null
  estadoProvincia: string | null
  estadoProvinciaTexto: string
  cidade: string
  endereco: string
}

export type EstadoOrigemDestino = Record<LadoLocal, EstadoLadoOrigemDestino>

export const ESTADO_LADO_ORIGEM_DESTINO_INICIAL: EstadoLadoOrigemDestino = {
  porto: null,
  proximosHabilitado: false,
  proximos: [''],
  extrasHabilitado: false,
  pais: null,
  estadoProvincia: null,
  estadoProvinciaTexto: '',
  cidade: '',
  endereco: '',
}

type EstadoLado = EstadoLadoOrigemDestino
type EstadoSimulador = EstadoOrigemDestino
const ESTADO_LADO_INICIAL = ESTADO_LADO_ORIGEM_DESTINO_INICIAL

const PASSOS_WIZARD = [
  { id: 1, label: 'Modal e Operação', icone: <Truck weight="duotone" size={16} /> },
  { id: 2, label: 'Origem e Destino', icone: <MapPin weight="duotone" size={16} /> },
  { id: 3, label: 'Carga e Incoterm', icone: <Package weight="duotone" size={16} /> },
  { id: 4, label: 'Fornecedores', icone: <Users weight="duotone" size={16} /> },
  { id: 5, label: 'Resumo', icone: <FileText weight="duotone" size={16} /> },
] as const

export type ModalFreteOrigemDestino = 'MARITIMO' | 'AEREO' | 'RODOVIARIO' | ''

/** Amostra estática do catálogo real (portos) — só para o manual. */
const PORTOS_CATALOGO: SelectOpcao[] = [
  { valor: 'BRSSZ', rotulo: 'Santos (BRSSZ) — Brasil' },
  { valor: 'BRPNG', rotulo: 'Paranaguá (BRPNG) — Brasil' },
  { valor: 'BRITJ', rotulo: 'Itajaí (BRITJ) — Brasil' },
  { valor: 'BRRIG', rotulo: 'Rio Grande (BRRIG) — Brasil' },
  { valor: 'BRSUA', rotulo: 'Suape (BRSUA) — Brasil' },
  { valor: 'CNSHA', rotulo: 'Xangai (CNSHA) — China' },
  { valor: 'CNNGB', rotulo: 'Ningbo (CNNGB) — China' },
  { valor: 'CNSZX', rotulo: 'Shenzhen (CNSZX) — China' },
  { valor: 'SGSIN', rotulo: 'Singapura (SGSIN) — Singapura' },
  { valor: 'KRPUS', rotulo: 'Busan (KRPUS) — Coreia do Sul' },
  { valor: 'NLRTM', rotulo: 'Roterdã (NLRTM) — Países Baixos' },
  { valor: 'DEHAM', rotulo: 'Hamburgo (DEHAM) — Alemanha' },
  { valor: 'USNYC', rotulo: 'Nova York (USNYC) — Estados Unidos' },
  { valor: 'USLAX', rotulo: 'Los Angeles (USLAX) — Estados Unidos' },
]

/** Amostra estática do catálogo real (aeroportos IATA) — só para o manual. */
const AEROPORTOS_CATALOGO: SelectOpcao[] = [
  { valor: 'GRU', rotulo: 'Guarulhos (GRU) — Brasil' },
  { valor: 'VCP', rotulo: 'Viracopos (VCP) — Brasil' },
  { valor: 'GIG', rotulo: 'Galeão (GIG) — Brasil' },
  { valor: 'CNF', rotulo: 'Confins (CNF) — Brasil' },
  { valor: 'CWB', rotulo: 'Afonso Pena (CWB) — Brasil' },
  { valor: 'PVG', rotulo: 'Pudong (PVG) — China' },
  { valor: 'PEK', rotulo: 'Pequim Capital (PEK) — China' },
  { valor: 'HKG', rotulo: 'Hong Kong (HKG) — Hong Kong' },
  { valor: 'SIN', rotulo: 'Changi (SIN) — Singapura' },
  { valor: 'ICN', rotulo: 'Incheon (ICN) — Coreia do Sul' },
  { valor: 'AMS', rotulo: 'Schiphol (AMS) — Países Baixos' },
  { valor: 'FRA', rotulo: 'Frankfurt (FRA) — Alemanha' },
  { valor: 'JFK', rotulo: 'John F. Kennedy (JFK) — Estados Unidos' },
  { valor: 'LAX', rotulo: 'Los Angeles (LAX) — Estados Unidos' },
  { valor: 'MIA', rotulo: 'Miami (MIA) — Estados Unidos' },
]

function catalogoLocalPorModal(modal: ModalFreteOrigemDestino): SelectOpcao[] {
  return modal === 'AEREO' ? AEROPORTOS_CATALOGO : PORTOS_CATALOGO
}

function tipoLocalPorModal(modal: ModalFreteOrigemDestino): 'porto' | 'aeroporto' | 'rodoviario' {
  if (modal === 'AEREO') return 'aeroporto'
  if (modal === 'RODOVIARIO') return 'rodoviario'
  return 'porto'
}

/** Amostra estática de cidades BR por UF — só para o manual. */
const CIDADES_BR_POR_UF: Record<string, SelectOpcao[]> = {
  SP: [
    { valor: 'São Paulo', rotulo: 'São Paulo' },
    { valor: 'Campinas', rotulo: 'Campinas' },
    { valor: 'Santos', rotulo: 'Santos' },
  ],
  PR: [
    { valor: 'Curitiba', rotulo: 'Curitiba' },
    { valor: 'Londrina', rotulo: 'Londrina' },
  ],
  SC: [
    { valor: 'Itajaí', rotulo: 'Itajaí' },
    { valor: 'Joinville', rotulo: 'Joinville' },
  ],
  RS: [
    { valor: 'Porto Alegre', rotulo: 'Porto Alegre' },
    { valor: 'Rio Grande', rotulo: 'Rio Grande' },
  ],
  PE: [
    { valor: 'Recife', rotulo: 'Recife' },
    { valor: 'Suape', rotulo: 'Suape' },
  ],
  RJ: [
    { valor: 'Rio de Janeiro', rotulo: 'Rio de Janeiro' },
    { valor: 'Niterói', rotulo: 'Niterói' },
  ],
}

const PAISES_CATALOGO: SelectOpcao[] = [
  { valor: 'BR', rotulo: 'Brasil' },
  { valor: 'CN', rotulo: 'China' },
  { valor: 'US', rotulo: 'Estados Unidos' },
  { valor: 'DE', rotulo: 'Alemanha' },
  { valor: 'NL', rotulo: 'Países Baixos' },
  { valor: 'AR', rotulo: 'Argentina' },
]

/** Rodoviário — exemplos restritos à América do Sul (manual University). */
const PAISES_AMERICA_SUL_CATALOGO: SelectOpcao[] = [
  { valor: 'AR', rotulo: 'Argentina' },
  { valor: 'BO', rotulo: 'Bolívia' },
  { valor: 'BR', rotulo: 'Brasil' },
  { valor: 'CL', rotulo: 'Chile' },
  { valor: 'CO', rotulo: 'Colômbia' },
  { valor: 'EC', rotulo: 'Equador' },
  { valor: 'GY', rotulo: 'Guiana' },
  { valor: 'PY', rotulo: 'Paraguai' },
  { valor: 'PE', rotulo: 'Peru' },
  { valor: 'SR', rotulo: 'Suriname' },
  { valor: 'UY', rotulo: 'Uruguai' },
  { valor: 'VE', rotulo: 'Venezuela' },
]

const UFS_BR: SelectOpcao[] = [
  { valor: 'SP', rotulo: 'SP' },
  { valor: 'PR', rotulo: 'PR' },
  { valor: 'SC', rotulo: 'SC' },
  { valor: 'RS', rotulo: 'RS' },
  { valor: 'PE', rotulo: 'PE' },
  { valor: 'RJ', rotulo: 'RJ' },
]

function rotuloLocalCompleto(codigo: string | null, modal: ModalFreteOrigemDestino = ''): string | null {
  if (!codigo) return null
  const opcao = catalogoLocalPorModal(modal).find((p) => String(p.valor) === codigo)
    ?? PORTOS_CATALOGO.find((p) => String(p.valor) === codigo)
    ?? AEROPORTOS_CATALOGO.find((p) => String(p.valor) === codigo)
  if (!opcao) return null
  return String(opcao.rotulo)
}

function rotuloLocalCurto(codigo: string | null, modal: ModalFreteOrigemDestino = ''): string | null {
  const completo = rotuloLocalCompleto(codigo, modal)
  if (!completo) return null
  return completo.split(' — ')[0]
}

/** Texto de origem/destino para o passo Resumo do wizard. */
export function resolverTextoLocalResumo(
  dados: EstadoLadoOrigemDestino,
  modal: ModalFreteOrigemDestino = '',
): { titulo: string; detalhe: string } {
  const tipoLocal = tipoLocalPorModal(modal)
  if (tipoLocal === 'rodoviario') {
    const rotulo = rotuloLocalRodoviario(dados)
    if (!rotulo) return { titulo: '—', detalhe: '—' }
    const partes = rotulo.split(' · ')
    return {
      titulo: partes[partes.length - 1] || rotulo,
      detalhe: rotulo,
    }
  }
  const completo = rotuloLocalCompleto(dados.porto, modal)
  const curto = rotuloLocalCurto(dados.porto, modal)
  return {
    titulo: curto || '—',
    detalhe: completo || '—',
  }
}

export const CAMPOS_ORIGEM_DESTINO_BID_FRETE: CampoGuiaAoVivo<CampoOrigemDestinoId>[] = [
  {
    id: 'porto_origem',
    num: '01',
    rotulo: 'Local de origem',
    paragrafoGuia:
      'Define a **origem** da carga conforme o modal: **porto** (marítimo), **aeroporto** (aéreo) ou **país / estado / cidade** (rodoviário). No marítimo e aéreo você ainda pode autorizar locais próximos e dados de coleta.',
    descricaoPontos: [
      'Marítimo: porto preferencial de embarque',
      'Aéreo: aeroporto preferencial de embarque',
      'Rodoviário: país, estado/província e cidade de origem',
    ],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Opção de **locais próximos** (marítimo/aéreo)',
      'Campos de **coleta na origem** (marítimo/aéreo)',
      'Rotas e propostas dos fornecedores no passo **Visibilidade** e no **Resumo**',
    ],
    icone: MapPin,
    cor: '#38bdf8',
    borda: 'rgba(56,189,248,.32)',
    fundo: 'rgba(56,189,248,.08)',
  },
  {
    id: 'portos_proximos_origem',
    num: '02',
    rotulo: 'Portos próximos (origem)',
    paragrafoGuia:
      'Autoriza cotações em **outros portos próximos** à origem preferencial. Amplia o leque de propostas dos fornecedores sem trocar o porto principal.',
    descricaoPontos: [
      'Opcional: marque para habilitar',
      'Adicione um ou mais portos alternativos',
      'Fornecedores podem cotar também por esses portos',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Linhas de **portos alternativos** na origem',
      'Mais opções de preço e prazo nas propostas',
    ],
    icone: ListPlus,
    cor: '#2dd4bf',
    borda: 'rgba(45,212,191,.32)',
    fundo: 'rgba(45,212,191,.08)',
  },
  {
    id: 'coleta_origem',
    num: '03',
    rotulo: 'Coleta na origem',
    paragrafoGuia:
      'Exibe **País**, **Estado/Província** e **Endereço** de origem (dados do exportador). Use para cotar a **coleta na origem** (exemplo **EXW**).',
    descricaoPontos: [
      'Dados do exportador: país, estado/província e endereço',
      'Útil para coleta na origem (exemplo EXW)',
      'Opcional neste passo',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Cotação de **coleta** no endereço do exportador',
      'Exibição desses locais no **Resumo** da cotação',
    ],
    icone: MapPin,
    cor: '#34d399',
    borda: 'rgba(52,211,153,.32)',
    fundo: 'rgba(52,211,153,.08)',
  },
  {
    id: 'porto_destino',
    num: '04',
    rotulo: 'Local de destino',
    paragrafoGuia:
      'Define o **destino** da carga conforme o modal: **porto** (marítimo), **aeroporto** (aéreo) ou **país / estado / cidade** (rodoviário). No marítimo e aéreo você ainda pode autorizar locais próximos e dados de entrega.',
    descricaoPontos: [
      'Marítimo: porto preferencial de destino',
      'Aéreo: aeroporto preferencial de destino',
      'Rodoviário: país, estado/província e cidade de destino',
    ],
    obrigatorio: true,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO', 'RODOVIARIO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Opção de **locais próximos** (marítimo/aéreo)',
      'Campos de **entrega no destino** (marítimo/aéreo)',
      'Rotas e propostas dos fornecedores no passo **Visibilidade** e no **Resumo**',
    ],
    icone: MapPin,
    cor: '#818cf8',
    borda: 'rgba(129,140,248,.32)',
    fundo: 'rgba(99,102,241,.08)',
  },
  {
    id: 'portos_proximos_destino',
    num: '05',
    rotulo: 'Portos próximos (destino)',
    paragrafoGuia:
      'Autoriza cotações em **outros portos próximos** ao destino preferencial. Amplia o leque de propostas dos fornecedores sem trocar o porto principal.',
    descricaoPontos: [
      'Opcional: marque para habilitar',
      'Adicione um ou mais portos alternativos',
      'Fornecedores podem cotar também por esses portos',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Linhas de **portos alternativos** no destino',
      'Mais opções de preço e prazo nas propostas',
    ],
    icone: ListPlus,
    cor: '#c4b5fd',
    borda: 'rgba(196,181,253,.28)',
    fundo: 'rgba(167,139,250,.08)',
  },
  {
    id: 'entrega_destino',
    num: '06',
    rotulo: 'Entrega no destino',
    paragrafoGuia:
      'Exibe **País**, **Estado/Província** e **Endereço** de destino (dados do importador). Use para cotar a **entrega no destino** (porta a porta).',
    descricaoPontos: [
      'Dados do importador: país, estado/província e endereço',
      'Útil para entrega porta a porta',
      'Opcional neste passo',
    ],
    obrigatorio: false,
    aplicavelOperacao: ['IMPORTACAO', 'EXPORTACAO'],
    aplicavelModal: ['MARITIMO', 'AEREO'],
    aplicavelModalidade: ['FCL', 'LCL', 'FTL', 'LTL'],
    habilitaPassosPosteriores: [
      'Cotação de **entrega** no endereço do importador',
      'Exibição desses locais no **Resumo** da cotação',
    ],
    icone: Buildings,
    cor: '#fbbf24',
    borda: 'rgba(251,191,36,.28)',
    fundo: 'rgba(251,191,36,.08)',
  },
]

const ORDEM_CAMPOS_GUIA: CampoOrigemDestinoId[] = [
  'porto_origem',
  'portos_proximos_origem',
  'coleta_origem',
  'porto_destino',
  'portos_proximos_destino',
  'entrega_destino',
]

function rotuloLocalRodoviario(dados: EstadoLado): string | null {
  const pais = PAISES_AMERICA_SUL_CATALOGO.find((p) => String(p.valor) === dados.pais)?.rotulo
  if (!pais || !dados.cidade.trim()) return null
  const uf = dados.pais === 'BR' ? dados.estadoProvincia : dados.estadoProvinciaTexto.trim()
  return uf ? `${pais} · ${uf} · ${dados.cidade.trim()}` : `${pais} · ${dados.cidade.trim()}`
}

function ladoRodoviarioPreenchido(dados: EstadoLado): boolean {
  if (!dados.pais || !dados.cidade.trim()) return false
  if (dados.pais === 'BR') return Boolean(dados.estadoProvincia)
  return true
}

function resolverRotuloSelecao(
  estado: EstadoSimulador,
  id: CampoOrigemDestinoId,
  modal: ModalFreteOrigemDestino = '',
): string | null {
  const lado: LadoLocal = id.endsWith('destino') ? 'destino' : 'origem'
  const dados = estado[lado]
  const tipoLocal = tipoLocalPorModal(modal)
  const aereo = tipoLocal === 'aeroporto'
  const rodoviario = tipoLocal === 'rodoviario'
  switch (id) {
    case 'porto_origem':
    case 'porto_destino':
      return rodoviario ? rotuloLocalRodoviario(dados) : rotuloLocalCurto(dados.porto, modal)
    case 'portos_proximos_origem':
    case 'portos_proximos_destino': {
      if (rodoviario || !dados.proximosHabilitado) return null
      const escolhidos = dados.proximos.filter((c) => c !== '')
      if (escolhidos.length === 0) {
        return aereo ? 'Habilitado: escolha os aeroportos' : 'Habilitado: escolha os portos'
      }
      const primeiro = rotuloLocalCurto(escolhidos[0], modal)
      return escolhidos.length === 1
        ? `${primeiro}`
        : `${primeiro} +${escolhidos.length - 1}`
    }
    case 'coleta_origem':
    case 'entrega_destino': {
      if (rodoviario || !dados.extrasHabilitado) return null
      const pais = PAISES_CATALOGO.find((p) => String(p.valor) === dados.pais)?.rotulo
      if (!pais) return 'Campos exibidos'
      const uf = dados.pais === 'BR' ? dados.estadoProvincia : dados.estadoProvinciaTexto
      return uf ? `${pais} · ${uf}` : String(pais)
    }
    default:
      return null
  }
}

function resolverExplicacao(
  estado: EstadoSimulador,
  foco: CampoOrigemDestinoId | null,
  modal: ModalFreteOrigemDestino = '',
): string {
  if (!foco) return ''
  const lado: LadoLocal = foco.endsWith('destino') ? 'destino' : 'origem'
  const dados = estado[lado]
  const tipoLocal = tipoLocalPorModal(modal)
  const aereo = tipoLocal === 'aeroporto'
  const rodoviario = tipoLocal === 'rodoviario'
  const nomeLocal = aereo ? 'aeroporto' : 'porto'
  switch (foco) {
    case 'porto_origem': {
      if (rodoviario) {
        const rotulo = rotuloLocalRodoviario(dados)
        return rotulo
          ? `Você definiu **${rotulo}** como **local rodoviário de origem**. Os fornecedores cotarão a coleta/saída a partir deste ponto (país, estado/província e cidade).`
          : ''
      }
      const rotulo = rotuloLocalCurto(dados.porto, modal)
      return rotulo
        ? `Você selecionou **${rotulo}** como ${nomeLocal} de **embarque preferencial**. Os fornecedores cotarão a saída da carga por este ${nomeLocal}. Nesta tela você ainda pode autorizar **${aereo ? 'aeroportos' : 'portos'} próximos** e informar **dados do exportador** (país, estado/província e endereço) para cotações de coleta.`
        : ''
    }
    case 'porto_destino': {
      if (rodoviario) {
        const rotulo = rotuloLocalRodoviario(dados)
        return rotulo
          ? `Você definiu **${rotulo}** como **local rodoviário de destino**. Os fornecedores cotarão a entrega/chegada neste ponto (país, estado/província e cidade).`
          : ''
      }
      const rotulo = rotuloLocalCurto(dados.porto, modal)
      return rotulo
        ? `Você selecionou **${rotulo}** como ${nomeLocal} de **destino preferencial**. Os fornecedores cotarão a chegada da carga por este ${nomeLocal}. Nesta tela você ainda pode autorizar **${aereo ? 'aeroportos' : 'portos'} próximos** e informar **dados do importador** (país, estado/província e endereço) para cotações de entrega.`
        : ''
    }
    case 'portos_proximos_origem':
    case 'portos_proximos_destino': {
      const escolhidos = dados.proximos.filter((c) => c !== '')
      const ladoTexto = lado === 'origem' ? 'à origem' : 'ao destino'
      if (escolhidos.length === 0) {
        return `Opção habilitada: adicione os **${aereo ? 'aeroportos' : 'portos'} próximos ${ladoTexto}** que você **aceita na proposta**, além do ${nomeLocal} de preferência. Use **Adicionar ${nomeLocal}** para incluir mais linhas.`
      }
      const nomes = escolhidos
        .map((c) => rotuloLocalCurto(c, modal))
        .filter(Boolean)
        .map((n) => `**${n}**`)
        .join(', ')
      return `Você autorizou cotações também em ${nomes}. Fornecedores podem propor rotas por ${escolhidos.length === 1 ? `este ${nomeLocal}` : `estes ${aereo ? 'aeroportos' : 'portos'}`}, ampliando as opções de preço e prazo.`
    }
    case 'coleta_origem':
      return 'Campos de **coleta na origem** exibidos: preencha **País**, **Estado/Província** e **Endereço** (dados do exportador) para cotar a coleta (exemplo **EXW**). Desmarque se não precisar.'
    case 'entrega_destino':
      return 'Campos de **entrega no destino** exibidos: preencha **País**, **Estado/Província** e **Endereço** (dados do importador) para cotar a entrega porta a porta. Desmarque se não precisar.'
    default:
      return ''
  }
}

function CartaoLocalSimulador({
  lado,
  dados,
  modalFrete,
  aoAtualizar,
  aoInteragir,
  aoDesligarCampo,
}: {
  lado: LadoLocal
  dados: EstadoLado
  modalFrete: ModalFreteOrigemDestino
  aoAtualizar: (parcial: Partial<EstadoLado>) => void
  aoInteragir: (campo: CampoOrigemDestinoId) => void
  aoDesligarCampo: (campo: CampoOrigemDestinoId) => void
}) {
  const origem = lado === 'origem'
  const tipoLocal = tipoLocalPorModal(modalFrete)
  const aereo = tipoLocal === 'aeroporto'
  const rodoviario = tipoLocal === 'rodoviario'
  const catalogo = catalogoLocalPorModal(modalFrete)
  const IconeLocal = aereo ? AirplaneTilt : Anchor
  const idPorto: CampoOrigemDestinoId = origem ? 'porto_origem' : 'porto_destino'
  const idProximos: CampoOrigemDestinoId = origem ? 'portos_proximos_origem' : 'portos_proximos_destino'
  const idExtras: CampoOrigemDestinoId = origem ? 'coleta_origem' : 'entrega_destino'
  const preenchido = rodoviario ? ladoRodoviarioPreenchido(dados) : Boolean(dados.porto)
  const cidadesBr = dados.estadoProvincia ? (CIDADES_BR_POR_UF[dados.estadoProvincia] ?? []) : []

  const opcoesAlternativas = useMemo(
    () => catalogo.filter((p) => String(p.valor) !== dados.porto),
    [catalogo, dados.porto],
  )

  const persistirLinhas = (linhas: string[]) => {
    aoAtualizar({ proximos: linhas.length > 0 ? linhas : [''] })
  }

  const tituloCard = rodoviario
    ? (origem ? 'Local rodoviário de Origem' : 'Local rodoviário de Destino')
    : aereo
      ? (origem ? 'Aeroporto de Origem' : 'Aeroporto de Destino')
      : (origem ? 'Porto / Aeroporto de Origem' : 'Porto / Aeroporto de Destino')
  const captionCard = rodoviario
    ? (origem
      ? 'Informe país, estado/província e cidade de origem'
      : 'Informe país, estado/província e cidade de destino')
    : aereo
      ? (origem
        ? 'Selecione o aeroporto de embarque de preferência'
        : 'Selecione o aeroporto de destino de preferência')
      : (origem
        ? 'Selecione o porto de embarque de preferência'
        : 'Selecione o porto de destino de preferência')
  const labelCampo = aereo
    ? (origem ? 'Aeroporto de embarque' : 'Aeroporto de destino')
    : (origem ? 'Porto de embarque' : 'Porto de destino')
  const placeholderCampo = aereo ? 'Selecione o aeroporto...' : 'Selecione o porto...'
  const fraseProximos = aereo
    ? (origem
      ? 'Autorizar cotações em outros aeroportos próximos à origem preferencial'
      : 'Autorizar cotações em outros aeroportos próximos ao destino preferencial')
    : (origem
      ? 'Autorizar cotações em outros portos próximos à origem preferencial'
      : 'Autorizar cotações em outros portos próximos ao destino preferencial')
  const hintProximos = aereo
    ? 'Selecione aeroportos próximos que você aceita na proposta, além do aeroporto de preferência acima.'
    : 'Selecione portos próximos que você aceita na proposta, além do porto de preferência acima.'
  const botaoAdicionar = aereo ? 'Adicionar aeroporto' : 'Adicionar porto'

  return (
    <div
      className={`nc-location-visual-card nc-location-visual-card--${origem ? 'origin' : 'destination'}${preenchido ? ' nc-location-visual-card--selected' : ''}`}
    >
      <div className="nc-location-visual-header">
        <div className="nc-location-visual-circle">
          <MapPin weight="duotone" size={26} className={origem ? 'nc-pulsing-icon' : 'nc-pulsing-icon-dest'} />
        </div>
        <div className="nc-location-visual-text">
          <h4>{tituloCard}</h4>
          <p className="nc-caption">{captionCard}</p>
        </div>
      </div>

      <div className="nc-location-body">
        {rodoviario ? (
          <div className="nc-fields-grid nc-fields-grid--location-extras">
            <SimuladorNcField
              label={origem ? 'País de origem' : 'País de destino'}
              obrigatorio
              icone={<GlobeHemisphereWest {...ICONE_FIELD} />}
            >
              <SelectGlobal
                iconeEsquerda={<MapPin size={16} />}
                opcoes={PAISES_AMERICA_SUL_CATALOGO}
                valor={dados.pais}
                aoMudarValor={(v) => {
                  aoAtualizar({
                    pais: v ? String(v) : null,
                    estadoProvincia: null,
                    estadoProvinciaTexto: '',
                    cidade: '',
                  })
                  aoInteragir(idPorto)
                }}
                placeholder="Selecione o país..."
                buscavel
                posicao="auto"
              />
            </SimuladorNcField>
            <SimuladorNcField
              label={origem ? 'Estado ou província de origem' : 'Estado ou província de destino'}
              obrigatorio={dados.pais === 'BR'}
              icone={<MapPin {...ICONE_FIELD} />}
            >
              {dados.pais === 'BR' ? (
                <SelectGlobal
                  opcoes={UFS_BR}
                  valor={dados.estadoProvincia}
                  aoMudarValor={(v) => {
                    aoAtualizar({
                      estadoProvincia: v ? String(v) : null,
                      cidade: '',
                    })
                    aoInteragir(idPorto)
                  }}
                  placeholder="Selecione o UF"
                  buscavel
                  desabilitado={!dados.pais}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  placeholder={origem ? 'Ex: Buenos Aires' : 'Ex: Montevideo'}
                  value={dados.estadoProvinciaTexto}
                  disabled={!dados.pais}
                  onChange={(e) => {
                    aoAtualizar({ estadoProvinciaTexto: e.target.value })
                    aoInteragir(idPorto)
                  }}
                />
              )}
            </SimuladorNcField>
            <SimuladorNcField
              label={origem ? 'Cidade de origem' : 'Cidade de destino'}
              className="nc-field--span-2"
              obrigatorio
              icone={<Buildings {...ICONE_FIELD} />}
            >
              {dados.pais === 'BR' ? (
                <SelectGlobal
                  opcoes={cidadesBr}
                  valor={dados.cidade || null}
                  aoMudarValor={(v) => {
                    aoAtualizar({ cidade: v ? String(v) : '' })
                    aoInteragir(idPorto)
                  }}
                  placeholder="Selecione a cidade"
                  buscavel
                  desabilitado={!dados.estadoProvincia}
                  posicao="auto"
                />
              ) : (
                <input
                  className="nc-input"
                  placeholder={origem ? 'Ex: Montevideo' : 'Ex: Buenos Aires'}
                  value={dados.cidade}
                  disabled={!dados.pais}
                  onChange={(e) => {
                    aoAtualizar({ cidade: e.target.value })
                    aoInteragir(idPorto)
                  }}
                />
              )}
            </SimuladorNcField>
          </div>
        ) : (
          <>
            <SimuladorNcField
              label={labelCampo}
              obrigatorio
              icone={<IconeLocal {...ICONE_FIELD} />}
            >
              <SelectGlobal
                iconeEsquerda={<IconeLocal size={16} />}
                opcoes={catalogo}
                valor={dados.porto}
                aoMudarValor={(v) => {
                  const codigo = v ? String(v) : null
                  aoAtualizar({
                    porto: codigo,
                    proximos: dados.proximos.filter((c) => c !== codigo),
                  })
                  if (codigo) aoInteragir(idPorto)
                }}
                placeholder={placeholderCampo}
                buscavel
                posicao="auto"
              />
            </SimuladorNcField>

            <div className="nc-exibir-campos-linha">
              <label className="nc-exibir-campos-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={dados.proximosHabilitado}
                  onChange={(e) => {
                    const marcado = e.target.checked
                    aoAtualizar({ proximosHabilitado: marcado, proximos: [''] })
                    if (marcado) {
                      aoInteragir(idProximos)
                    } else {
                      aoDesligarCampo(idProximos)
                    }
                  }}
                />
                <span>{fraseProximos}</span>
              </label>
            </div>

            {dados.proximosHabilitado ? (
              <div className="nc-locais-adicionais-bloco">
                <div className="nc-linhas-container-header">
                  <p className="nc-cargo-subsecao-hint">{hintProximos}</p>
                  <button
                    type="button"
                    className="nc-btn-adicionar-linha"
                    onClick={() => {
                      aoAtualizar({ proximos: [...dados.proximos, ''] })
                      aoInteragir(idProximos)
                    }}
                  >
                    <Plus size={12} weight="bold" />
                    {botaoAdicionar}
                  </button>
                </div>
                {dados.proximos.map((codigo, indice) => (
                  <div key={`${lado}-local-${indice}`} className="nc-linha-armazem-row">
                    <SimuladorNcField
                      label="Locais adicionais aceitos"
                      obrigatorio
                      icone={<IconeLocal {...ICONE_FIELD} />}
                    >
                      <SelectGlobal
                        iconeEsquerda={<IconeLocal size={16} />}
                        opcoes={opcoesAlternativas.filter(
                          (o) => String(o.valor) === codigo || !dados.proximos.includes(String(o.valor)),
                        )}
                        valor={codigo || null}
                        aoMudarValor={(v) => {
                          const novo = String(v ?? '')
                          persistirLinhas(dados.proximos.map((c, i) => (i === indice ? novo : c)))
                          aoInteragir(idProximos)
                        }}
                        placeholder={placeholderCampo}
                        buscavel
                        posicao="auto"
                      />
                    </SimuladorNcField>
                    <button
                      type="button"
                      className="nc-btn-remover-linha"
                      title="Remover local"
                      aria-label="Remover local"
                      disabled={dados.proximos.length <= 1 && !codigo}
                      onClick={() => {
                        persistirLinhas(dados.proximos.filter((_, i) => i !== indice))
                        aoInteragir(idProximos)
                      }}
                    >
                      <Trash size={14} weight="bold" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="nc-exibir-campos-linha">
              <label className="nc-exibir-campos-checkbox">
                <input
                  type="checkbox"
                  className="nc-checkbox-padrao"
                  checked={dados.extrasHabilitado}
                  onChange={(e) => {
                    const marcado = e.target.checked
                    aoAtualizar({ extrasHabilitado: marcado })
                    if (marcado) {
                      aoInteragir(idExtras)
                    } else {
                      aoDesligarCampo(idExtras)
                    }
                  }}
                />
                <span>
                  {origem
                    ? 'Exibir campos: cidade, estado/província e país de origem para cotações de coleta na origem'
                    : 'Exibir campos: cidade, estado/província e país de destino para cotações de coleta'}
                </span>
              </label>
            </div>

            {dados.extrasHabilitado ? (
              <div className="nc-fields-grid--location-extras">
                <SimuladorNcField
                  label={origem ? 'País de origem' : 'País de destino'}
                  icone={<GlobeHemisphereWest {...ICONE_FIELD} />}
                >
                  <SelectGlobal
                    iconeEsquerda={<MapPin size={16} />}
                    opcoes={PAISES_CATALOGO}
                    valor={dados.pais}
                    aoMudarValor={(v) => {
                      aoAtualizar({
                        pais: v ? String(v) : null,
                        estadoProvincia: null,
                        estadoProvinciaTexto: '',
                        cidade: '',
                      })
                      aoInteragir(idExtras)
                    }}
                    placeholder="Selecione o país..."
                    buscavel
                    posicao="auto"
                  />
                </SimuladorNcField>
                <SimuladorNcField
                  label={origem ? 'Estado ou província de origem' : 'Estado ou província de destino'}
                  obrigatorio={dados.pais === 'BR'}
                  icone={<MapPin {...ICONE_FIELD} />}
                >
                  {dados.pais === 'BR' ? (
                    <SelectGlobal
                      opcoes={UFS_BR}
                      valor={dados.estadoProvincia}
                      aoMudarValor={(v) => {
                        aoAtualizar({ estadoProvincia: v ? String(v) : null, cidade: '' })
                        aoInteragir(idExtras)
                      }}
                      placeholder="Selecione o UF"
                      buscavel
                      posicao="auto"
                    />
                  ) : (
                    <input
                      className="nc-input"
                      placeholder={origem ? 'Ex: California' : 'Ex: São Paulo'}
                      value={dados.estadoProvinciaTexto}
                      disabled={!dados.pais}
                      onChange={(e) => {
                        aoAtualizar({ estadoProvinciaTexto: e.target.value })
                        aoInteragir(idExtras)
                      }}
                    />
                  )}
                </SimuladorNcField>
                <SimuladorNcField
                  label={origem ? 'Endereço de origem' : 'Endereço de destino'}
                  className="nc-field--span-2"
                  icone={<MapPin {...ICONE_FIELD} />}
                >
                  <input
                    className="nc-input"
                    placeholder="Complemento de endereço (opcional)"
                    value={dados.endereco}
                    onChange={(e) => {
                      aoAtualizar({ endereco: e.target.value })
                      aoInteragir(idExtras)
                    }}
                  />
                </SimuladorNcField>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function portosProximosValidos(dados: EstadoLado): boolean {
  if (!dados.proximosHabilitado) return true
  return dados.proximos.some((codigo) => codigo !== '')
}

/** Paridade com canNext() — passo «origem» conforme modal. */
export function podeAvancarPassoOrigemDestino(
  estado: EstadoOrigemDestino,
  modalFrete: ModalFreteOrigemDestino = '',
): boolean {
  if (tipoLocalPorModal(modalFrete) === 'rodoviario') {
    return ladoRodoviarioPreenchido(estado.origem) && ladoRodoviarioPreenchido(estado.destino)
  }
  return Boolean(estado.origem.porto)
    && Boolean(estado.destino.porto)
    && portosProximosValidos(estado.origem)
    && portosProximosValidos(estado.destino)
}

export function resolverSelecoesOrigemDestino(
  estado: EstadoOrigemDestino,
  interagiu: Partial<Record<CampoOrigemDestinoId, boolean>>,
  modalFrete: ModalFreteOrigemDestino = '',
): SelecaoGuiaAoVivo<CampoOrigemDestinoId>[] {
  return ORDEM_CAMPOS_GUIA.flatMap((id) => {
    if (!interagiu[id]) return []
    const valor = resolverRotuloSelecao(estado, id, modalFrete)
    if (!valor) return []
    return [{ id, valor }]
  })
}

export function resolverExplicacaoOrigemDestino(
  estado: EstadoOrigemDestino,
  foco: CampoOrigemDestinoId | null,
  modalFrete: ModalFreteOrigemDestino = '',
): string {
  return resolverExplicacao(estado, foco, modalFrete)
}

/** Conteúdo do passo 2 — embutido no wizard unificado do manual. */
export function ConteudoPassoOrigemDestinoSimulador({
  estado,
  modalFrete = 'MARITIMO',
  aoAtualizarLado,
  aoInteragir,
  aoDesligarCampo,
}: {
  estado: EstadoOrigemDestino
  modalFrete?: ModalFreteOrigemDestino
  aoAtualizarLado: (lado: LadoLocal, parcial: Partial<EstadoLadoOrigemDestino>) => void
  aoInteragir: (campo: CampoOrigemDestinoId) => void
  aoDesligarCampo: (campo: CampoOrigemDestinoId) => void
}) {
  return (
    <div className="nc-root nc-step-wrapper nc-fade-in">
      <div className="nc-step-content nc-origem-destino-stack">
        <CartaoLocalSimulador
          lado="origem"
          dados={estado.origem}
          modalFrete={modalFrete}
          aoAtualizar={(parcial) => aoAtualizarLado('origem', parcial)}
          aoInteragir={aoInteragir}
          aoDesligarCampo={aoDesligarCampo}
        />
        <CartaoLocalSimulador
          lado="destino"
          dados={estado.destino}
          modalFrete={modalFrete}
          aoAtualizar={(parcial) => aoAtualizarLado('destino', parcial)}
          aoInteragir={aoInteragir}
          aoDesligarCampo={aoDesligarCampo}
        />
      </div>
    </div>
  )
}

/** Manual BID Frete §4.02.01 — réplica standalone (legado; preferir wizard unificado). */
export function ManualBidFreteSimuladorOrigemDestino() {
  const [estado, setEstado] = useState<EstadoSimulador>(() => ({
    origem: { ...ESTADO_LADO_INICIAL },
    destino: { ...ESTADO_LADO_INICIAL },
  }))
  const [foco, setFoco] = useState<CampoOrigemDestinoId | null>(null)
  const [interagiu, setInteragiu] = useState<Partial<Record<CampoOrigemDestinoId, boolean>>>({})

  const marcarInteracao = (campo: CampoOrigemDestinoId) => {
    setInteragiu((prev) => ({ ...prev, [campo]: true }))
    setFoco(campo)
  }

  const atualizarLado = (lado: LadoLocal, parcial: Partial<EstadoLado>) => {
    setEstado((prev) => ({ ...prev, [lado]: { ...prev[lado], ...parcial } }))
  }

  const selecoesPreenchidas = useMemo(
    () => resolverSelecoesOrigemDestino(estado, interagiu),
    [estado, interagiu],
  )

  const campoGuiaAtivo = useMemo((): CampoOrigemDestinoId | null => {
    if (!foco) return null
    if (!selecoesPreenchidas.some((s) => s.id === foco)) return null
    return foco
  }, [foco, selecoesPreenchidas])

  const explicacao = useMemo(
    () => resolverExplicacaoOrigemDestino(estado, campoGuiaAtivo),
    [estado, campoGuiaAtivo],
  )

  return (
    <div id="sim-bid-frete-origem-destino" style={{ marginTop: MANUAL_ESPACO_PARAGRAFO_PX }}>
      <p style={{
        margin: '0 0 10px',
        fontSize: '.75rem',
        lineHeight: 1.45,
        color: 'color-mix(in srgb, var(--ws-text, #f1f5f9) 65%, transparent)',
        fontStyle: 'italic',
      }}>
        Tela interativa: cada escolha permanece visível no painel guia à direita (exemplo com modal Marítimo)
      </p>
      <style>{NC_ESTILOS_SIMULADOR_MODAL_OPERACAO}</style>
      <style>{NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO}</style>
      <div className="sim-modal-operacao-layout">
        <div>
          <ManualBidFreteSimuladorWizardEmbutido
            titulo="Nova Cotação de Frete Internacional"
            subtitulo="Preencha os dados para solicitar cotações de frete"
            icone={<Truck weight="duotone" size={22} />}
            passos={[...PASSOS_WIZARD]}
            passoAtual={2}
            larguraTotal
            podeAvancar={false}
            podeVoltar
          >
            <ConteudoPassoOrigemDestinoSimulador
              estado={estado}
              aoAtualizarLado={atualizarLado}
              aoInteragir={marcarInteracao}
              aoDesligarCampo={(campo) => setFoco((prev) => (prev === campo ? null : prev))}
            />
          </ManualBidFreteSimuladorWizardEmbutido>
        </div>

        <ManualBidFreteGuiaAoVivo
          campos={CAMPOS_ORIGEM_DESTINO_BID_FRETE}
          selecoes={selecoesPreenchidas}
          campoAtivo={campoGuiaAtivo}
          textoContextual={explicacao}
          onSelecionarCampo={(id) => setFoco((prev) => (prev === id ? null : id))}
        />
      </div>
    </div>
  )
}
