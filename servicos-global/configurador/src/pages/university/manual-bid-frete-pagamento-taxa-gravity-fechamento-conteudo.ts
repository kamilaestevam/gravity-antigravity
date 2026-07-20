import type { DocPassoVisual } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'
import { screenshotBidFreteInt as S } from './manual-bid-frete-catalogo-screenshots'

const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/docs/bid-frete#doc-sec-11|Configurações}}'
const LINK_GRAVITY_STORE = '{{link:/university-gravity/docs/store|Gravity Store}}'
const TEXTO_VALOR_TAXA_VARIAVEL =
  `**podendo variar** (consulte ${LINK_GRAVITY_STORE} e ${LINK_MANUAL_BID_FRETE_CONFIGURACOES})`

/** §8 — taxa de fechamento (success fee) da plataforma Gravity após aprovação do frete. */
export const PASSOS_MANUAL_BID_FRETE_PAGAMENTO_TAXA_GRAVITY_FECHAMENTO: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'A Gravity possui uma **Taxa de Fechamento** (success fee) por frete fechado na plataforma, ' +
        TEXTO_VALOR_TAXA_VARIAVEL +
        '. Ela só é devida após o **Fechamento** confirmado: participar da cotação, enviar proposta ou ser aprovado **não** gera cobrança automática por si só.',
      'A taxa pode ser paga pelo **comprador** (**Contratante Gravity**) ou pelo **fornecedor**. **Por padrão**, a responsabilidade é do **comprador**; o usuário **master** altera essa regra em ' +
        LINK_MANUAL_BID_FRETE_CONFIGURACOES +
        ' → **Preferências** → **Empresa que deve pagar a taxa de fechamento da plataforma Gravity**.',
      'Conforme a seleção, **avisos em destaque**, **e-mails transacionais** e **contratos eletrônicos** (termo de envio de proposta e contrato de fechamento) são gerados com textos distintos para cada modalidade.',
    ],
    imagem: S('taxa_quem_paga_1'),
    imagemAbaixoTexto: true,
    legendaAposImagem: 'Preferências: quem paga a taxa',
    legendaAposImagemAlinhamento: 'left',
    galeriaComparacaoAposImagem: [
      {
        textoIntro:
          '**Exemplo: taxa paga pelo fornecedor.** No **e-mail de solicitação de cotação** enviado ao fornecedor, o resumo exibe **Taxa de fechamento paga por: Fornecedor** e um aviso em destaque com o **valor da taxa** em caso de fechamento (ilustrativo no print; ' +
          TEXTO_VALOR_TAXA_VARIAVEL +
          ').',
        colunas: 1,
        telas: [
          {
            legenda: '',
            imagem: S('taxa_quem_paga_2'),
          },
          {
            legenda: '',
            imagem: S('taxa_quem_paga_3'),
            paragrafoAntes:
              'O aviso informa que a cotação é gratuita para participar, mas que, se o cliente fechar o frete com a empresa do fornecedor, o valor da taxa será debitado da conta na Gravity (ex.: **USD 10,00** no print abaixo), com link para as **condições da plataforma**.',
          },
        ],
        calloutApos: {
          tipo: 'dica',
          texto:
            'Se o pagador for o **Contratante Gravity** (comprador), o campo passa a **Contratante Gravity** e o aviso informa que o fornecedor **não será cobrado** por essa taxa: a organização compradora arca com o success fee.',
        },
      },
      {
        tituloEtapa: 'Termo de ciência ao enviar proposta',
        colunas: 1,
        telas: [
          {
            legenda: '',
            paragrafoAntes:
              'Antes de enviar a proposta, o fornecedor deve ler o **Termo de Ciência de Envio de Proposta**. O subtítulo do documento reflete quem paga a taxa e o **valor vigente**: neste exemplo, **Taxa de fechamento paga pelo Fornecedor** com valor em USD.',
            imagem: S('taxa_quem_paga_4'),
          },
          {
            legenda: '',
            imagem: S('taxa_quem_paga_6'),
            paragrafoAntes:
              'No **Contrato de Prestação de Serviços de Fechamento na Plataforma**, aceito na confirmação **Recebi e estou de acordo**, as cláusulas de cobrança também seguem o pagador definido: boleto mensal do fornecedor ou faturamento ao **Contratante Gravity**.',
          },
        ],
        calloutApos: {
          tipo: 'lembrete',
          texto:
            'Os contratos de **envio de proposta** e de **fechamento** possuem versões distintas para cada pagador. O fornecedor sempre vê o texto correspondente à configuração vigente no workspace no momento do disparo da cotação.',
        },
      },
      {
        tituloEtapa: 'E-mail e aceite após aprovação',
        colunas: 1,
        telas: [
          {
            legenda: '',
            paragrafoAntes:
              'Quando a proposta é **aprovada**, o fornecedor ganhador recebe e-mail com o resumo e, novamente, o **aviso sobre a taxa de fechamento**: coerente com quem foi definido como pagador.',
            imagem: S('taxa_quem_paga_5'),
          },
          {
            legenda: '',
            imagem: S('taxa_quem_paga_7'),
            paragrafoAntes:
              'Na página pública **Confirmar recebimento da aprovação**, o fornecedor marca **Li e aceito o contrato de fechamento** e confirma com **Recebi e estou de acordo**. O box **Taxa de fechamento** indica o valor e quem paga: neste exemplo, **pela sua empresa** (fornecedor).',
          },
        ],
        calloutApos: [
          {
            tipo: 'dica',
            texto:
              'Na aprovação pelo comprador, o modal **Confirmar aprovação** também exibe aviso distinto: cobrança da organização compradora ou do fornecedor via boleto mensal, conforme a preferência do workspace.',
          },
          {
            tipo: 'lembrete',
            texto:
              'Alterações em **Preferências** afetam **novas cotações** disparadas após salvar. Cotações já enviadas mantêm o pagador registrado no momento do envio.',
          },
        ],
      },
    ],
  },
])
