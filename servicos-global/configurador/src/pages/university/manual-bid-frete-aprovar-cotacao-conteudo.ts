import type { DocPassoVisual } from './manual-configurador-conteudo'
import { renumerarPassos } from './manual-configurador-conteudo'

type PassoSemNumero = Omit<DocPassoVisual, 'num' | 'rotuloSecao' | 'numPai' | 'passosFilhos'>

/** §8 — aprovação da melhor proposta e fechamento da cotação. */
export const PASSOS_MANUAL_BID_FRETE_APROVAR_COTACAO: DocPassoVisual[] = renumerarPassos([
  {
    titulo: 'Visão geral',
    tituloCurto: 'Visão geral',
    paragrafos: [
      'A **aprovação** registra o **fornecedor ganhador** e o **valor** fechado, atualiza o **status** da cotação e encerra a rodada de respostas dos agentes de carga.',
      'O fluxo pode ser iniciado pelo card **Melhor proposta** no **Painel de Insights**, pela aba **Propostas** ou pelo **comparativo** de ofertas.',
    ],
  },
])
