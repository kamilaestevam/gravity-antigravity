import type { DocPassoVisual } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num' | 'rotuloSecao' | 'numPai' | 'passosFilhos'>

const LINK_MANUAL_BID_FRETE_CONFIGURACOES =
  '{{link:/university-gravity/docs/bid-frete#doc-sec-11|Configurações}}'

/** §9 — taxa de fechamento (success fee) da plataforma Gravity após aprovação do frete. */
export const PASSOS_MANUAL_BID_FRETE_PAGAMENTO_TAXA_GRAVITY_FECHAMENTO: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'Quando o importador **aprova** a proposta e confirma o **fechamento** do frete na plataforma, pode nascer a **Taxa de Fechamento** da Gravity — **USD 10,00** por frete fechado (success fee).',
      'Quem paga depende da configuração do workspace: **fornecedor** (boleto mensal consolidado) ou **contratante Gravity** (sem cobrança do agente de carga). Ajuste o pagador em ' +
        LINK_MANUAL_BID_FRETE_CONFIGURACOES +
        '.',
      'A taxa só é devida após o **Fechamento** confirmado — participar da cotação ou enviar proposta **não** gera cobrança.',
    ],
  },
])
