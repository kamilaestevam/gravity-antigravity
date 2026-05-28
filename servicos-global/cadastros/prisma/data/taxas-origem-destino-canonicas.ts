export type TipoTaxaOrigemDestinoCanonico = 'ORIGEM' | 'DESTINO' | 'FRETE'

export interface TaxaOrigemDestinoCanonica {
  codigo: string
  nome: string
  descricao?: string
  tipo: TipoTaxaOrigemDestinoCanonico
}

export const TAXAS_ORIGEM_DESTINO_CANONICAS: TaxaOrigemDestinoCanonica[] = [
  { codigo: 'THC_ORIGEM', nome: 'THC Origem', descricao: 'Terminal Handling Charge no porto/aeroporto de origem', tipo: 'ORIGEM' },
  { codigo: 'BL_FEE', nome: 'BL Fee', descricao: 'Taxa de conhecimento de embarque', tipo: 'ORIGEM' },
  { codigo: 'ISPS', nome: 'ISPS', tipo: 'ORIGEM' },
  { codigo: 'DOC_FEE', nome: 'Documentation Fee', tipo: 'ORIGEM' },
  { codigo: 'SEAL', nome: 'Seal Fee', tipo: 'ORIGEM' },
  { codigo: 'VGM', nome: 'VGM', tipo: 'ORIGEM' },
  { codigo: 'PICKUP', nome: 'Pick Up', tipo: 'ORIGEM' },
  { codigo: 'THC_DESTINO', nome: 'THC Destino', tipo: 'DESTINO' },
  { codigo: 'DO_FEE', nome: 'D/O Fee', tipo: 'DESTINO' },
  { codigo: 'CUSTOMS_CLEAR', nome: 'Customs Clearance', tipo: 'DESTINO' },
  { codigo: 'DELIVERY', nome: 'Delivery', tipo: 'DESTINO' },
  { codigo: 'HANDLING_DEST', nome: 'Handling Destino', tipo: 'DESTINO' },
  { codigo: 'BUNKER', nome: 'Bunker Adjustment Factor', tipo: 'FRETE' },
  { codigo: 'BAF', nome: 'BAF', tipo: 'FRETE' },
  { codigo: 'CAF', nome: 'CAF', tipo: 'FRETE' },
  { codigo: 'PSS', nome: 'PSS', tipo: 'FRETE' },
  { codigo: 'GRI', nome: 'GRI', tipo: 'FRETE' },
]
