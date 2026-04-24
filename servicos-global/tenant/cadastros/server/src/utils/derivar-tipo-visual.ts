/**
 * Tipo da empresa NÃO é campo persistido — é DERIVADO das flags pode_ser_*.
 * Documento de referência: seção 4.1 do documento técnico Cadastros.
 *
 * Esta função é a fonte canônica de derivação. Backend e SDK do client a
 * utilizam para gerar o label exibido na UI ("Importador",
 * "Importador + Exportador", "Importador + Exportador + Agente").
 */

export interface FlagsTipoEmpresa {
  pode_ser_importador_empresa: boolean
  pode_ser_exportador_empresa: boolean
  pode_ser_fabricante_empresa: boolean
  pode_ser_agente_empresa: boolean
  pode_ser_despachante_empresa: boolean
  pode_ser_armador_empresa: boolean
}

/**
 * Ordem fixa para garantir saída estável e idempotente.
 * Importador e Exportador aparecem primeiro porque são os papéis primários
 * em qualquer operação COMEX; demais aparecem em ordem alfabética.
 */
const ORDEM_PAPEIS: ReadonlyArray<{ flag: keyof FlagsTipoEmpresa; label: string }> = [
  { flag: 'pode_ser_importador_empresa', label: 'Importador' },
  { flag: 'pode_ser_exportador_empresa', label: 'Exportador' },
  { flag: 'pode_ser_agente_empresa', label: 'Agente' },
  { flag: 'pode_ser_armador_empresa', label: 'Armador' },
  { flag: 'pode_ser_despachante_empresa', label: 'Despachante' },
  { flag: 'pode_ser_fabricante_empresa', label: 'Fabricante' },
]

export function derivarTipoVisual(empresa: FlagsTipoEmpresa): string {
  const papeis = ORDEM_PAPEIS.filter(({ flag }) => empresa[flag] === true).map(({ label }) => label)

  if (papeis.length === 0) {
    // Nenhuma flag ativa nunca deveria passar pela validação Zod;
    // se chegou até aqui, é bug — falha ruidosa (Mandamento 08).
    throw new Error(
      '[derivarTipoVisual] Empresa sem nenhuma flag pode_ser_* ativa. Validação Zod foi pulada?',
    )
  }

  return papeis.join(' + ')
}
