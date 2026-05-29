/**
 * containers-canonicos.ts — Catálogo canônico ISO 6346 (~26 tipos práticos).
 *
 * Padrão internacional fixo — não muda por organização.
 * Fonte: ISO 6346 (size/type codes) + prática do frete marítimo FCL.
 *
 * Mapeamento aplicado pelo seed:
 *   - codigo_iso_container ← código ISO 6346 (4 caracteres, unique)
 *   - tipo_container       ← enum ContainerTipo
 *   - tamanho_container    ← "20'" | "40'" | "40'HC" | "45'HC"
 *   - ativo_container      ← true
 *
 * Substitui listas estáticas legadas (20DRY, 40HC, etc.) nos produtos BID Frete.
 */

export type ContainerTipoCanonico =
  | 'DRY'
  | 'REEFER'
  | 'OPEN_TOP'
  | 'FLAT_RACK'
  | 'TANK'
  | 'BULK'
  | 'PLATAFORMA'

export interface ContainerCanonico {
  codigo_iso_container: string
  tipo_container: ContainerTipoCanonico
  tamanho_container: string
  descricao: string
}

/** 26 tipos práticos — SSOT para cadastros.container */
export const CONTAINERS_CANONICOS: ContainerCanonico[] = [
  // DRY (5)
  { codigo_iso_container: '22G0', tipo_container: 'DRY', tamanho_container: "20'", descricao: "20' General Purpose Dry" },
  { codigo_iso_container: '42G0', tipo_container: 'DRY', tamanho_container: "40'", descricao: "40' General Purpose Dry" },
  { codigo_iso_container: '45G0', tipo_container: 'DRY', tamanho_container: "40'HC", descricao: "40' High Cube Dry" },
  { codigo_iso_container: 'L2G0', tipo_container: 'DRY', tamanho_container: "45'HC", descricao: "45' High Cube Dry" },
  { codigo_iso_container: '22G1', tipo_container: 'DRY', tamanho_container: "20'", descricao: "20' Dry with passive vents" },

  // REEFER (4)
  { codigo_iso_container: '22R1', tipo_container: 'REEFER', tamanho_container: "20'", descricao: "20' Reefer" },
  { codigo_iso_container: '42R1', tipo_container: 'REEFER', tamanho_container: "40'", descricao: "40' Reefer" },
  { codigo_iso_container: '45R1', tipo_container: 'REEFER', tamanho_container: "40'HC", descricao: "40' High Cube Reefer" },
  { codigo_iso_container: 'L2R1', tipo_container: 'REEFER', tamanho_container: "45'HC", descricao: "45' High Cube Reefer" },

  // OPEN_TOP (3)
  { codigo_iso_container: '22U1', tipo_container: 'OPEN_TOP', tamanho_container: "20'", descricao: "20' Open Top" },
  { codigo_iso_container: '42U1', tipo_container: 'OPEN_TOP', tamanho_container: "40'", descricao: "40' Open Top" },
  { codigo_iso_container: '45U1', tipo_container: 'OPEN_TOP', tamanho_container: "40'HC", descricao: "40' High Cube Open Top" },

  // FLAT_RACK (3)
  { codigo_iso_container: '22P1', tipo_container: 'FLAT_RACK', tamanho_container: "20'", descricao: "20' Flat Rack" },
  { codigo_iso_container: '42P1', tipo_container: 'FLAT_RACK', tamanho_container: "40'", descricao: "40' Flat Rack" },
  { codigo_iso_container: '45P1', tipo_container: 'FLAT_RACK', tamanho_container: "40'HC", descricao: "40' High Cube Flat Rack" },

  // TANK (3)
  { codigo_iso_container: '22T6', tipo_container: 'TANK', tamanho_container: "20'", descricao: "20' Tank" },
  { codigo_iso_container: '42T6', tipo_container: 'TANK', tamanho_container: "40'", descricao: "40' Tank" },
  { codigo_iso_container: '45T6', tipo_container: 'TANK', tamanho_container: "40'HC", descricao: "40' High Cube Tank" },

  // BULK (3)
  { codigo_iso_container: '22B0', tipo_container: 'BULK', tamanho_container: "20'", descricao: "20' Bulk" },
  { codigo_iso_container: '42B0', tipo_container: 'BULK', tamanho_container: "40'", descricao: "40' Bulk" },
  { codigo_iso_container: '45B0', tipo_container: 'BULK', tamanho_container: "40'HC", descricao: "40' High Cube Bulk" },

  // PLATAFORMA (5)
  { codigo_iso_container: '22P3', tipo_container: 'PLATAFORMA', tamanho_container: "20'", descricao: "20' Platform fixed" },
  { codigo_iso_container: '42P3', tipo_container: 'PLATAFORMA', tamanho_container: "40'", descricao: "40' Platform fixed" },
  { codigo_iso_container: '45P3', tipo_container: 'PLATAFORMA', tamanho_container: "40'HC", descricao: "40' High Cube Platform" },
  { codigo_iso_container: '22P7', tipo_container: 'PLATAFORMA', tamanho_container: "20'", descricao: "20' Flat collapsible" },
  { codigo_iso_container: '42P7', tipo_container: 'PLATAFORMA', tamanho_container: "40'", descricao: "40' Flat collapsible" },
]
