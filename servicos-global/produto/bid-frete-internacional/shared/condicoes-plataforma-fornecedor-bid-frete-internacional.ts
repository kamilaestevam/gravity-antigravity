/**
 * Condições de uso da plataforma para fornecedores (BID Frete Internacional).
 * SSOT para e-mail de disparo e página pública sem login.
 */

export const ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL =
  '/bid-frete/visao-fornecedor-bid-frete-internacional/condicoes-plataforma'

/** Taxa cobrada quando o cliente fecha o frete com o fornecedor na plataforma. */
export const TAXA_FECHAMENTO_FRETE_USD = 10

export const ROTULO_TAXA_FECHAMENTO_FRETE_USD = 'USD 10,00'

export function resolverUrlCondicoesPlataformaFornecedorBidFreteInternacional(
  linkResposta: string,
): string {
  try {
    const url = new URL(linkResposta)
    return `${url.origin}${ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL}`
  } catch {
    return ROTA_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL
  }
}

export interface SecaoCondicoesPlataformaFornecedorBidFreteInternacional {
  titulo: string
  paragrafos: string[]
}

export const SECOES_CONDICOES_PLATAFORMA_FORNECEDOR_BID_FRETE_INTERNACIONAL: SecaoCondicoesPlataformaFornecedorBidFreteInternacional[] =
  [
    {
      titulo: '1. Cotação gratuita',
      paragrafos: [
        'Participar de cotações e enviar propostas pelo BID Frete Internacional da Gravity não gera cobrança.',
        'Você pode analisar o resumo da solicitação, acessar o link de resposta e registrar sua proposta sem pagamento para uso da plataforma nessa etapa.',
      ],
    },
    {
      titulo: '2. Taxa de fechamento (success fee)',
      paragrafos: [
        `Quando o importador ou exportador escolher a sua proposta e o frete for fechado com sua empresa por meio desta plataforma, será cobrado ${ROTULO_TAXA_FECHAMENTO_FRETE_USD} (dez dólares americanos) da sua empresa, conforme a forma de cobrança descrita abaixo.`,
        'A cobrança ocorre somente após a confirmação do fechamento do frete vinculado à cotação respondida por você.',
        'Não há cobrança se a cotação não resultar em fechamento ou se o cliente optar por outro fornecedor.',
      ],
    },
    {
      titulo: '3. Forma de cobrança',
      paragrafos: [
        'A cobrança é feita por boleto mensal: as taxas de fechamento do mês são consolidadas em um único boleto emitido para a sua empresa.',
        'O boleto detalha as cotações fechadas no período, com o número de cada cotação e o valor correspondente.',
        'Em caso de dúvida sobre um débito, entre em contato com o suporte Gravity informando o número da cotação.',
      ],
    },
    {
      titulo: '4. Confidencialidade do cliente',
      paragrafos: [
        'Quando o solicitante optar por ocultar o nome da empresa, você verá apenas a indicação de cliente anônimo no e-mail e na tela de resposta.',
        'A confidencialidade não altera as regras de taxa: a cotação continua gratuita e a taxa de fechamento aplica-se apenas se o frete for fechado com sua empresa.',
      ],
    },
    {
      titulo: '5. Aceite',
      paragrafos: [
        'Ao enviar uma proposta pelo link recebido, você declara ciência destas condições — o aviso é exibido junto ao botão Enviar Proposta.',
        'A Gravity pode atualizar este documento; a versão vigente estará sempre disponível nesta página.',
      ],
    },
  ]
