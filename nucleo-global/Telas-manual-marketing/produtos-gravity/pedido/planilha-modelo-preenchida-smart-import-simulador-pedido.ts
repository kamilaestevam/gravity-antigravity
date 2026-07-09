import { gerarBufferTemplateXlsxSmartImportSimuladorPedido } from './gerar-template-xlsx-smart-import-simulador-pedido'

export const NOME_PLANILHA_MODELO_PREENCHIDA_SMART_IMPORT_SIMULADOR =
  'planilha_preenchido_teste_site_marketplace.xlsx'

function dispararDownloadBlob(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

async function carregarBlobPlanilhaModeloPreenchida(): Promise<Blob> {
  const buffer = await gerarBufferTemplateXlsxSmartImportSimuladorPedido({
    preencherExemploDemonstracao: true,
  })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/** Baixa a planilha modelo Gravity pré-preenchida (1 pedido + 1 item de demonstração). */
export async function baixarPlanilhaModeloPreenchidaSmartImportSimuladorPedido(): Promise<void> {
  const blob = await carregarBlobPlanilhaModeloPreenchida()
  dispararDownloadBlob(blob, NOME_PLANILHA_MODELO_PREENCHIDA_SMART_IMPORT_SIMULADOR)
}
