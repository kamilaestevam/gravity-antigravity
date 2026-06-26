/** Mensagens amigáveis para falha de análise na sidebar do wizard Nova Leitura. */

export const TITULO_ERRO_ARQUIVO_LEITURA_SMART_READ = 'Análise não concluída'

export const AVISO_SEM_COBRANCA_ERRO_ARQUIVO_LEITURA_SMART_READ =
  'Este arquivo não será cobrado.'

export type InterpretacaoErroArquivoLeituraSmartRead = {
  titulo: string
  motivo: string
  aviso_sem_cobranca: string
}

export function interpretarErroArquivoLeituraSmartRead(
  mensagem: string | null,
): InterpretacaoErroArquivoLeituraSmartRead {
  const base = {
    titulo: TITULO_ERRO_ARQUIVO_LEITURA_SMART_READ,
    aviso_sem_cobranca: AVISO_SEM_COBRANCA_ERRO_ARQUIVO_LEITURA_SMART_READ,
  }

  if (!mensagem?.trim()) {
    return {
      ...base,
      motivo:
        'Não foi possível concluir a leitura deste arquivo. Verifique se o arquivo está íntegro e tente reenviar.',
    }
  }

  const texto = mensagem.trim().toLowerCase()

  if (
    texto.includes('sem vínculo com o smart docs legado') ||
    texto.includes('sem vínculo com o smart read legado') ||
    texto.includes('organizacao_sem_vinculo')
  ) {
    return {
      ...base,
      motivo:
        'Sua organização ainda não está vinculada ao serviço de leitura. Entre em contato com o suporte Gravity.',
    }
  }

  if (
    texto.includes('smart_read_legado_url') ||
    texto.includes('smart_read_legado_chave_gravity') ||
    texto.includes('legado indisponível') ||
    texto.includes('legado inacessivel')
  ) {
    return {
      ...base,
      motivo: 'O serviço de leitura está indisponível no momento. Tente novamente em alguns minutos.',
    }
  }

  if (texto.includes('soffice binary') || texto.includes('could not find soffice')) {
    return {
      ...base,
      motivo:
        'Planilhas Excel (.xlsx) não puderam ser convertidas para análise. Envie o documento em PDF ou como imagem (JPG/PNG).',
    }
  }

  if (texto.includes('central directory') || texto.includes('is this a zip')) {
    return {
      ...base,
      motivo:
        'O formato .xls (Excel antigo) não é suportado na conversão automática. Salve como .xlsx ou exporte para PDF antes de anexar.',
    }
  }

  if (texto.includes('convert excel to pdf') || texto.includes('error to convert excel')) {
    return {
      ...base,
      motivo:
        'Não foi possível converter a planilha para análise. Tente PDF, CSV ou imagem do documento.',
    }
  }

  if (texto.includes('403 forbidden') || texto.includes('respondeu 403')) {
    return {
      ...base,
      motivo:
        'Arquivos XML ainda não estão liberados para leitura automática neste ambiente. Envie PDF, imagem ou planilha.',
    }
  }

  if (texto.includes('tempo limite') || texto.includes('timeout')) {
    return {
      ...base,
      motivo: 'A análise demorou mais que o esperado. Tente reenviar o arquivo.',
    }
  }

  if (texto.includes('falha ao enviar') || texto.includes('falha no processamento')) {
    return {
      ...base,
      motivo: 'O envio ou processamento falhou antes de concluir a leitura. Tente anexar o arquivo novamente.',
    }
  }

  if (texto.includes('respondeu 422') || texto.includes('unprocessable')) {
    return {
      ...base,
      motivo:
        'O serviço não conseguiu processar este formato ou conteúdo. Verifique o arquivo ou use PDF/imagem.',
    }
  }

  if (texto.includes('respondeu 5') || texto.includes('service unavailable')) {
    return {
      ...base,
      motivo: 'O serviço de leitura apresentou instabilidade. Aguarde alguns minutos e tente novamente.',
    }
  }

  return {
    ...base,
    motivo:
      'Ocorreu uma falha inesperada na análise. Verifique se o arquivo está íntegro e no formato aceito pela plataforma.',
  }
}

/** Rótulo curto no status do card (evita dump técnico da API). */
export function formatarErroArquivoLeituraSmartRead(mensagem: string | null): string {
  return interpretarErroArquivoLeituraSmartRead(mensagem).titulo
}
