/**
 * Tipo do fornecedor DERIVADO das flags pode_ser_* (não persistido).
 */

export interface FlagsTipoFornecedor {
  pode_ser_importador_fornecedor: boolean
  pode_ser_exportador_fornecedor: boolean
  pode_ser_fabricante_fornecedor: boolean
  pode_ser_agente_fornecedor: boolean
  pode_ser_despachante_fornecedor: boolean
  pode_ser_armador_fornecedor: boolean
  pode_ser_cia_aerea_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: boolean
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: boolean
  pode_ser_armazem_alfandegado_fornecedor: boolean
  pode_ser_armazem_nacional_fornecedor: boolean
  pode_ser_banco_fornecedor: boolean
  pode_ser_seguradora_internacional_fornecedor: boolean
  pode_ser_seguradora_corretora_cambio_fornecedor: boolean
}

const ORDEM_PAPEIS: ReadonlyArray<{ flag: keyof FlagsTipoFornecedor; label: string }> = [
  { flag: 'pode_ser_importador_fornecedor', label: 'Importador' },
  { flag: 'pode_ser_exportador_fornecedor', label: 'Exportador' },
  { flag: 'pode_ser_agente_fornecedor', label: 'Agente' },
  { flag: 'pode_ser_armador_fornecedor', label: 'Armador' },
  { flag: 'pode_ser_armazem_alfandegado_fornecedor', label: 'Armazém Alfandegado' },
  { flag: 'pode_ser_armazem_nacional_fornecedor', label: 'Armazém Nacional' },
  { flag: 'pode_ser_banco_fornecedor', label: 'Banco' },
  { flag: 'pode_ser_cia_aerea_fornecedor', label: 'Cia Aérea' },
  { flag: 'pode_ser_despachante_fornecedor', label: 'Despachante' },
  { flag: 'pode_ser_fabricante_fornecedor', label: 'Fabricante' },
  { flag: 'pode_ser_seguradora_corretora_cambio_fornecedor', label: 'Seguradora / Corretora de Câmbio' },
  { flag: 'pode_ser_seguradora_internacional_fornecedor', label: 'Seguradora Internacional' },
  { flag: 'pode_ser_transportadora_rodoviaria_internacional_fornecedor', label: 'Transp. Rod. Internacional' },
  { flag: 'pode_ser_transportadora_rodoviaria_nacional_fornecedor', label: 'Transp. Rod. Nacional' },
]

export function derivarTipoVisual(fornecedor: FlagsTipoFornecedor): string {
  const papeis = ORDEM_PAPEIS.filter(({ flag }) => fornecedor[flag] === true).map(({ label }) => label)

  if (papeis.length === 0) {
    throw new Error(
      '[derivarTipoVisual] Fornecedor sem nenhuma flag pode_ser_* ativa. Validação Zod foi pulada?',
    )
  }

  return papeis.join(' + ')
}

/** @deprecated Use FlagsTipoFornecedor */
export type FlagsTipoEmpresa = FlagsTipoFornecedor
