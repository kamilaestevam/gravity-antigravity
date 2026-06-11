/**
 * cambio-siscomex-canonicos.ts — Catálogo canônico Siscomex/BACEN para câmbio.
 *
 * Tipos:
 *   - cobertura_cambial     → tabela Cobertura Cambial (DUIMP/DI)
 *   - modalidade_pagamento  → tabela Modalidade de Pagamento (LI/DI)
 *
 * Fontes: API Integra Comex (dadosCambiais), Tabelas Aduaneiras RFB.
 */

export type TipoCambioSiscomex = 'cobertura_cambial' | 'modalidade_pagamento'

export interface CambioSiscomexCanonico {
  codigo: string
  tipo: TipoCambioSiscomex
  nome: string
  descricao?: string
  ordem: number
}

export const COBERTURA_CAMBIAL_SISCOMEX: CambioSiscomexCanonico[] = [
  {
    codigo: 'ATE_180_DIAS',
    tipo: 'cobertura_cambial',
    nome: 'Até 180 dias',
    descricao: 'Importação com cobertura cambial — prazo de fechamento até 180 dias.',
    ordem: 1,
  },
  {
    codigo: '181_ATE_360',
    tipo: 'cobertura_cambial',
    nome: 'De 181 a 360 dias',
    descricao: 'Importação com cobertura cambial — prazo de 181 a 360 dias.',
    ordem: 2,
  },
  {
    codigo: 'ACIMA_360',
    tipo: 'cobertura_cambial',
    nome: 'Acima de 360 dias',
    descricao: 'Exige instituição financiadora, valor e número ROF/BACEN.',
    ordem: 3,
  },
  {
    codigo: 'SEM_COBERTURA',
    tipo: 'cobertura_cambial',
    nome: 'Sem cobertura cambial',
    descricao: 'Exige motivo conforme tabela Motivo da Importação sem Cobertura Cambial.',
    ordem: 4,
  },
]

export const MODALIDADE_PAGAMENTO_SISCOMEX: CambioSiscomexCanonico[] = [
  { codigo: '10', tipo: 'modalidade_pagamento', nome: 'Pagamento antecipado total ou preponderante', ordem: 10 },
  { codigo: '20', tipo: 'modalidade_pagamento', nome: "Pagamento à vista total ou preponderante — carta de crédito", ordem: 20 },
  { codigo: '21', tipo: 'modalidade_pagamento', nome: "Pagamento à vista total ou preponderante — outros", ordem: 21 },
  { codigo: '30', tipo: 'modalidade_pagamento', nome: "Financiamento do fornecedor (supplier's credit) — carta de crédito", ordem: 30 },
  { codigo: '31', tipo: 'modalidade_pagamento', nome: "Financiamento do fornecedor (supplier's credit) — outros", ordem: 31 },
  { codigo: '40', tipo: 'modalidade_pagamento', nome: "Financiamento de banco estrangeiro ao importador (buyer's credit) — carta de crédito", ordem: 40 },
  { codigo: '41', tipo: 'modalidade_pagamento', nome: "Financiamento de banco estrangeiro ao importador (buyer's credit) — outros", ordem: 41 },
  { codigo: '50', tipo: 'modalidade_pagamento', nome: 'Linha de crédito de banco estrangeiro a banco brasileiro — carta de crédito', ordem: 50 },
  { codigo: '51', tipo: 'modalidade_pagamento', nome: 'Linha de crédito de banco estrangeiro a banco brasileiro — outros', ordem: 51 },
  { codigo: '52', tipo: 'modalidade_pagamento', nome: 'Financiamento de instituição não financeira ao importador', ordem: 52 },
]

export const CAMBIO_SISCOMEX_CANONICOS: CambioSiscomexCanonico[] = [
  ...COBERTURA_CAMBIAL_SISCOMEX,
  ...MODALIDADE_PAGAMENTO_SISCOMEX,
]
