import { describe, it, expect } from 'vitest'
import {
  calcularScoreEssenciais,
  classificarPipelineImportacao,
  ehPlanilhaTemplateGravity,
  HASH_TEMPLATE_ROTULOS_V38,
} from '../../../servicos-global/produto/pedido/shared/classificarImportacao'

describe('classificarImportacao', () => {
  it('detecta template Gravity com super-header e colunas essenciais', () => {
    const cabecalhos = [
      '* Tipo Linha',
      '* Numero do Pedido',
      '* Tipo de Operacao',
      '* Part Number',
      '* Qtd. Inicial',
    ]
    const hash = HASH_TEMPLATE_ROTULOS_V38
    expect(ehPlanilhaTemplateGravity(cabecalhos, 2, hash)).toBe(true)
  })

  it('nao classifica CSV generico como template', () => {
    expect(
      ehPlanilhaTemplateGravity(['PO', 'SKU', 'Qty'], 1, 'abc123'),
    ).toBe(false)
  })

  it('score essenciais reflete campos mapeados', () => {
    const score = calcularScoreEssenciais([
      { campo_sistema: 'tipo_linha', confianca: 99 },
      { campo_sistema: 'numero_pedido', confianca: 99 },
      { campo_sistema: 'part_number_item', confianca: 99 },
      { campo_sistema: 'quantidade_inicial_item', confianca: 99 },
    ])
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('template detectado forca pipeline deterministico', () => {
    expect(
      classificarPipelineImportacao({
        memoriaAplicada: false,
        templateDetectado: true,
        scoreEssenciais: 0.5,
        extratorUsado: 'xlsx',
        extensaoArquivo: 'xlsx',
      }),
    ).toBe('deterministico')
  })

  it('score alto forca pipeline deterministico sem template', () => {
    expect(
      classificarPipelineImportacao({
        memoriaAplicada: false,
        templateDetectado: false,
        scoreEssenciais: 0.96,
        extratorUsado: 'xlsx',
        extensaoArquivo: 'xlsx',
      }),
    ).toBe('deterministico')
  })

  it('score baixo em planilha generica reserva gemini_mapeamento', () => {
    expect(
      classificarPipelineImportacao({
        memoriaAplicada: false,
        templateDetectado: false,
        scoreEssenciais: 0.4,
        extratorUsado: 'csv',
        extensaoArquivo: 'csv',
      }),
    ).toBe('gemini_mapeamento')
  })

  it('memoria aplicada nunca usa gemini', () => {
    expect(
      classificarPipelineImportacao({
        memoriaAplicada: true,
        templateDetectado: false,
        scoreEssenciais: 0.1,
        extratorUsado: 'xlsx',
        extensaoArquivo: 'xlsx',
      }),
    ).toBe('deterministico')
  })
})
