import { describe, expect, it } from 'vitest'
import {
  formatarLinhaCampoEditadoComunicacao,
  type CampoEditadoComunicacaoSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/listar-campos-editados-comunicacao-smart-read'
import { montarEmailFornecedorRiscosSmartRead } from '../../../../servicos-global/produto/smart-read/client/src/shared/montar-email-fornecedor-risco-smart-read'
import type { RiscoAduaneiroLeitura } from '../../../../servicos-global/produto/smart-read/shared/analise-riscos-leitura-smart-read'

const campo: CampoEditadoComunicacaoSmartRead = {
  id: 'a:0:seller.country',
  chave: 'seller.country',
  rotulo: 'País do exportador',
  valor_original: 'Hong Kong',
  valor_atual: 'China',
}

const risco: RiscoAduaneiroLeitura = {
  id: 'r1',
  titulo: 'NCM ausente',
  motivo: 'motivo',
  analise: 'analise',
  severidade: 'critico',
  categoria: 'ncm',
  evidencias: [],
}

describe('comunicação campos editados', () => {
  it('formata linha País editado de Hong Kong para China', () => {
    expect(formatarLinhaCampoEditadoComunicacao(campo)).toBe(
      'País do exportador editado de Hong Kong para China',
    )
  })

  it('inclui campo editado no e-mail junto com riscos', () => {
    const email = montarEmailFornecedorRiscosSmartRead([risco], 'pt', [campo])
    expect(email.corpo).toContain('País do exportador editado de Hong Kong para China')
    expect(email.corpo).toContain('NCM ausente')
    expect(email.corpo).toContain('Identificamos 2 ponto(s)')
    const idxRisco = email.corpo.indexOf('NCM ausente')
    const idxCampo = email.corpo.indexOf('País do exportador editado')
    const idxAcao = email.corpo.indexOf('Ação sugerida')
    expect(idxCampo).toBeGreaterThan(idxRisco)
    if (idxAcao >= 0) expect(idxCampo).toBeLessThan(idxAcao)
  })
})
