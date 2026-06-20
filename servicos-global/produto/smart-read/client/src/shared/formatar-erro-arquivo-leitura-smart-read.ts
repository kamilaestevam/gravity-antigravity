/** Mensagem curta para exibir no card da sidebar (evita dump técnico da API). */
export function formatarErroArquivoLeituraSmartRead(mensagem: string | null): string {
  if (!mensagem?.trim()) return 'Falha na análise'

  const texto = mensagem.trim()
  if (
    texto.includes('sem vínculo com o Smart Read legado') ||
    texto.includes('ORGANIZACAO_SEM_VINCULO')
  ) {
    return 'Vínculo Smart Read não configurado. Reinicie Configurador (8005) e sidecar (8033) com SMART_READ_ID_COMPANY_LEGADO_PADRAO=2.'
  }
  if (texto.includes('SMART_READ_LEGADO_URL') || texto.includes('SMART_READ_LEGADO_CHAVE_GRAVITY') || texto.includes('legado indisponível')) {
    return 'Serviço de leitura legado indisponível. Configure SMART_READ_LEGADO_URL e SMART_READ_LEGADO_CHAVE_GRAVITY (ou SMART_READ_MOCK_LEGADO=1 em dev).'
  }
  if (texto.length > 140) return `${texto.slice(0, 137)}…`
  return texto
}
