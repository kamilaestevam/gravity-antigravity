/**
 * Leitura órfã: criada no DATI sem upload/análise concluídos.
 * Não confundir com leituras que perderam registro de arquivo mas têm documentos/campos.
 */
export type MetricasOrfaTransacaoLeituraSmartRead = {
  total_arquivos: number
  total_documentos: number
  total_campos_extraidos: number
}

export function transacaoLeituraEhOrfaSmartRead(
  transacao: MetricasOrfaTransacaoLeituraSmartRead,
): boolean {
  return (
    transacao.total_arquivos === 0
    && transacao.total_documentos === 0
    && transacao.total_campos_extraidos === 0
  )
}
