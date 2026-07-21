/**
 * Alíquotas internas de ICMS (regra geral / efetiva) por UF — para desembaraço.
 *
 * Valores = carga efetiva da regra geral (ICMS + FCP/FECP/FECOEP quando a legislação
 * estadual soma na operação típica). Produtos com alíquota específica (NCM) ficam de fora.
 *
 * Fontes: RICMS / leis estaduais (ver base_legal). Atualizar quando a SEFAZ alterar.
 */
export type OpcaoIcmsSimulaCusto = {
  codigo: string
  uf: string | null
  nome: string
  /** Fração 0–1 */
  icms: number
  tipo: 'UF' | 'ESPECIAL'
  base_legal: string
}

/** Alíquota geral interna vigente (2026), com FCP quando aplicável à regra geral. */
export const ALIQUOTAS_ICMS_INTERNA_UF: OpcaoIcmsSimulaCusto[] = [
  { codigo: 'AC', uf: 'AC', nome: 'Acre', icms: 0.19, tipo: 'UF', base_legal: 'Art. 17, I, RICMS/AC' },
  {
    codigo: 'AL',
    uf: 'AL',
    nome: 'Alagoas',
    icms: 0.215,
    tipo: 'UF',
    base_legal: 'Lei 5.900/96 art. 17, I, b (20,5% — Lei 9.776/2025) + 1% FECOEP',
  },
  { codigo: 'AM', uf: 'AM', nome: 'Amazonas', icms: 0.20, tipo: 'UF', base_legal: 'Art. 12, I, LC 19/97' },
  { codigo: 'AP', uf: 'AP', nome: 'Amapá', icms: 0.18, tipo: 'UF', base_legal: 'Art. 25, III, RICMS/AP' },
  { codigo: 'BA', uf: 'BA', nome: 'Bahia', icms: 0.205, tipo: 'UF', base_legal: 'Art. 15, I, Lei 7.014/96' },
  { codigo: 'CE', uf: 'CE', nome: 'Ceará', icms: 0.20, tipo: 'UF', base_legal: 'Art. 45, I, RICMS/CE' },
  { codigo: 'DF', uf: 'DF', nome: 'Distrito Federal', icms: 0.20, tipo: 'UF', base_legal: 'Art. 18, II, Lei 1.254/96' },
  { codigo: 'ES', uf: 'ES', nome: 'Espírito Santo', icms: 0.17, tipo: 'UF', base_legal: 'Art. 71, I, RICMS/ES' },
  { codigo: 'GO', uf: 'GO', nome: 'Goiás', icms: 0.19, tipo: 'UF', base_legal: 'Art. 20, I, RCTE/GO' },
  { codigo: 'MA', uf: 'MA', nome: 'Maranhão', icms: 0.23, tipo: 'UF', base_legal: 'Art. 23, III, Lei 7.799/2002' },
  { codigo: 'MG', uf: 'MG', nome: 'Minas Gerais', icms: 0.18, tipo: 'UF', base_legal: 'Subitem 7.1, Anexo I, RICMS/MG' },
  { codigo: 'MS', uf: 'MS', nome: 'Mato Grosso do Sul', icms: 0.17, tipo: 'UF', base_legal: 'Art. 41, III, RICMS/MS' },
  { codigo: 'MT', uf: 'MT', nome: 'Mato Grosso', icms: 0.17, tipo: 'UF', base_legal: 'Art. 95, I, RICMS/MT' },
  { codigo: 'PA', uf: 'PA', nome: 'Pará', icms: 0.19, tipo: 'UF', base_legal: 'Art. 20, VII, RICMS/PA' },
  { codigo: 'PB', uf: 'PB', nome: 'Paraíba', icms: 0.20, tipo: 'UF', base_legal: 'Art. 13, IV, RICMS/PB' },
  { codigo: 'PE', uf: 'PE', nome: 'Pernambuco', icms: 0.205, tipo: 'UF', base_legal: 'Art. 15, VII, Lei 15.730/2016' },
  { codigo: 'PI', uf: 'PI', nome: 'Piauí', icms: 0.225, tipo: 'UF', base_legal: 'Art. 21, I, RICMS/PI' },
  { codigo: 'PR', uf: 'PR', nome: 'Paraná', icms: 0.195, tipo: 'UF', base_legal: 'Art. 17, V, RICMS/PR' },
  {
    codigo: 'RJ',
    uf: 'RJ',
    nome: 'Rio de Janeiro',
    icms: 0.22,
    tipo: 'UF',
    base_legal: 'Art. 14, I, Lei 2.657/96 (20%) + 2% FECP',
  },
  { codigo: 'RN', uf: 'RN', nome: 'Rio Grande do Norte', icms: 0.20, tipo: 'UF', base_legal: 'Art. 29, I, RICMS/RN' },
  { codigo: 'RO', uf: 'RO', nome: 'Rondônia', icms: 0.195, tipo: 'UF', base_legal: 'Art. 12, I, RICMS/RO' },
  { codigo: 'RR', uf: 'RR', nome: 'Roraima', icms: 0.20, tipo: 'UF', base_legal: 'Art. 46, I, RICMS/RR' },
  { codigo: 'RS', uf: 'RS', nome: 'Rio Grande do Sul', icms: 0.17, tipo: 'UF', base_legal: 'Art. 27, X, RICMS/RS' },
  { codigo: 'SC', uf: 'SC', nome: 'Santa Catarina', icms: 0.17, tipo: 'UF', base_legal: 'Art. 26, I, RICMS/SC' },
  {
    codigo: 'SE',
    uf: 'SE',
    nome: 'Sergipe',
    icms: 0.20,
    tipo: 'UF',
    base_legal: 'Art. 40, I, RICMS/SE (19%) + 1% FECOEP',
  },
  { codigo: 'SP', uf: 'SP', nome: 'São Paulo', icms: 0.18, tipo: 'UF', base_legal: 'Art. 52, I, RICMS/SP (Dec. 45.490/2000)' },
  { codigo: 'TO', uf: 'TO', nome: 'Tocantins', icms: 0.20, tipo: 'UF', base_legal: 'Art. 27, II, Lei 1.287/2001' },
].sort((a, b) => a.codigo.localeCompare(b.codigo))

/** Opções extras no select de ICMS (após as UFs). */
export const OPCOES_ICMS_ESPECIAIS: OpcaoIcmsSimulaCusto[] = [
  {
    codigo: 'BENEFICIO_FISCAL',
    uf: null,
    nome: 'Benefício Fiscal',
    icms: 0,
    tipo: 'ESPECIAL',
    base_legal: 'Opção de simulação — benefício/isenção (0%)',
  },
  {
    codigo: 'SUPERFLUOS',
    uf: null,
    nome: 'Supérfluos',
    icms: 0.25,
    tipo: 'ESPECIAL',
    base_legal: 'RICMS/SP art. 55 (25% — operações internas com produtos/serviços do artigo)',
  },
]

export function listarOpcoesIcmsSimulaCusto(): OpcaoIcmsSimulaCusto[] {
  return [...ALIQUOTAS_ICMS_INTERNA_UF, ...OPCOES_ICMS_ESPECIAIS]
}

export function listarUfsComIcms(): OpcaoIcmsSimulaCusto[] {
  return ALIQUOTAS_ICMS_INTERNA_UF
}

/** Alíquota interna da UF para gross-up do ICMS na importação. */
export function resolverAliquotaIcmsInternaUfSimulaCusto(uf: string): number | null {
  const opcao = ALIQUOTAS_ICMS_INTERNA_UF.find((u) => u.uf === uf)
  return opcao?.icms ?? null
}
