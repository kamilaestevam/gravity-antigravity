/**
 * smartImportService.template-mapping.test.ts — Teste de integracao P4.3
 *
 * Garante que o template gerado pelo `templateHandler` (linha 2 = rotulos
 * PT-BR de CAMPOS_PEDIDO_DDD + CAMPOS_ITEM_DDD) e' mapeado 100% pelo
 * `mapearComIA` refatorado para os campos corretos do sistema.
 *
 * Este teste e' a rede de regressao do bug raiz exposto em 11/05/2026:
 *   - "Numero do Pedido" caia como "Campo extra"
 *   - "Exportador — Nome", "Exportador — Endereco", "Exportador — Pais"
 *     todos colapsavam em `exportador`
 *   - 87 de 138 colunas viravam "Campo extra"
 *   - Confianca global 31%
 *
 * Apos P4: 100% das colunas viram match em tier 1 (rotulo PT-BR).
 *
 * Se este teste falhar, o template e o mapeador estao dessincronizados —
 * ou algum agente alterou um sem atualizar o outro.
 */

import { describe, it, expect } from 'vitest'
import { SmartImportService } from './smartImportService.js'
import {
  CAMPOS_PEDIDO_DDD,
  CAMPOS_ITEM_DDD,
  type CampoPedidoDDD,
} from '../../../shared/campos-pedido-ddd.js'

// Acesso ao metodo privado mapearComIA via cast (mesmo padrao do
// smartImportService.test.ts).
function mapearComIA(service: SmartImportService, cabecalhos: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (service as any).mapearComIA(cabecalhos, []) as Array<{
    coluna_arquivo: string
    campo_sistema: string | null
    confianca: number
    nivel: 'auto' | 'confirmado' | 'manual' | 'ignorado'
  }>
}

describe('P4.3 — Integracao template <-> mapeador', () => {
  const service = new SmartImportService({})
  const camposOrdenados: CampoPedidoDDD[] = [...CAMPOS_PEDIDO_DDD, ...CAMPOS_ITEM_DDD]
  const cabecalhos = camposOrdenados.map(c => c.rotulo)

  it('mapearComIA reconhece 100% dos rotulos do template', () => {
    const resultados = mapearComIA(service, cabecalhos)
    const naoMapeados = resultados.filter(r => r.campo_sistema === null)
    if (naoMapeados.length > 0) {
      throw new Error(
        `${naoMapeados.length} rotulos NAO mapeados:\n` +
        naoMapeados.map(r => `  - "${r.coluna_arquivo}"`).join('\n')
      )
    }
    expect(naoMapeados).toHaveLength(0)
  })

  it('cada rotulo unico mapeia para o `campo` correto', () => {
    const resultados = mapearComIA(service, cabecalhos)
    // Conta quantos rotulos sao unicos no template (ex: "Moeda" aparece 2x
    // — pedido + item — entao tem ambiguidade conhecida e aceita).
    const rotuloOcorrencias = new Map<string, number>()
    for (const c of camposOrdenados) {
      rotuloOcorrencias.set(c.rotulo, (rotuloOcorrencias.get(c.rotulo) ?? 0) + 1)
    }

    const erros: string[] = []
    resultados.forEach((r, idx) => {
      const esperado = camposOrdenados[idx]
      const ocorrencias = rotuloOcorrencias.get(esperado.rotulo) ?? 1
      if (ocorrencias === 1) {
        // Rotulo unico — deve mapear EXATAMENTE para o campo correspondente
        if (r.campo_sistema !== esperado.campo) {
          erros.push(
            `"${esperado.rotulo}" deveria mapear para "${esperado.campo}" mas mapeou para "${r.campo_sistema}"`
          )
        }
      } else {
        // Rotulo duplicado (ex: "Moeda") — deve mapear para UM dos campos
        // que compartilham o rotulo (nao precisa ser exatamente o desta linha,
        // pois sem contexto o mapeador escolhe nivel='pedido' por default).
        const camposComEsseRotulo = camposOrdenados
          .filter(c => c.rotulo === esperado.rotulo)
          .map(c => c.campo)
        if (!r.campo_sistema || !camposComEsseRotulo.includes(r.campo_sistema)) {
          erros.push(
            `"${esperado.rotulo}" (ambiguo) deveria mapear para um de [${camposComEsseRotulo.join(', ')}] mas mapeou para "${r.campo_sistema}"`
          )
        }
      }
    })

    if (erros.length > 0) {
      throw new Error(`${erros.length} mapeamentos errados:\n  - ${erros.join('\n  - ')}`)
    }
  })

  it('confianca media e >= 95%', () => {
    const resultados = mapearComIA(service, cabecalhos)
    const media = resultados.reduce((sum, r) => sum + r.confianca, 0) / resultados.length
    // Tier 1 da' 99 quando unico, 85 quando ambiguo. Com ~2 ambiguidades
    // em ~92 campos, a media fica perto de 98+.
    expect(media).toBeGreaterThanOrEqual(95)
  })

  it('apenas rotulos duplicados no SSOT ficam abaixo de 99 (ambiguidades aceitas)', () => {
    const resultados = mapearComIA(service, cabecalhos)
    // Calcula dinamicamente quais rotulos aparecem em mais de 1 campo do SSOT
    const rotuloOcorrencias = new Map<string, number>()
    for (const c of camposOrdenados) {
      rotuloOcorrencias.set(c.rotulo, (rotuloOcorrencias.get(c.rotulo) ?? 0) + 1)
    }
    const rotulosAmbiguos = new Set(
      Array.from(rotuloOcorrencias.entries()).filter(([, n]) => n > 1).map(([r]) => r)
    )
    const abaixoDe99 = resultados.filter(r => r.confianca < 99)
    for (const r of abaixoDe99) {
      expect(rotulosAmbiguos.has(r.coluna_arquivo)).toBe(true)
    }
  })

  it('regressao: bugs reportados em 11/05/2026 (tela do dono)', () => {
    const resultados = mapearComIA(service, cabecalhos)
    const mapa = new Map(resultados.map(r => [r.coluna_arquivo, r.campo_sistema]))

    // Bug #1 — cada subcampo do Exportador tem campo proprio
    expect(mapa.get('Exportador — Nome')).toBe('nome_exportador')
    expect(mapa.get('Exportador — Endereco')).toBe('endereco_exportador')
    expect(mapa.get('Exportador — Pais')).toBe('pais_exportador')
    expect(mapa.get('Exportador — Cidade')).toBe('cidade_exportador')
    expect(mapa.get('Exportador — Estado')).toBe('estado_exportador')
    expect(mapa.get('Exportador — ZIP Code')).toBe('zip_code_exportador')

    // Bug #1b — Referencia* NAO mapeia para numero_pedido
    expect(mapa.get('Referencia Importador')).toBe('referencia_importador_pedido')
    expect(mapa.get('Referencia Exportador')).toBe('referencia_exportador_pedido')
    expect(mapa.get('Referencia Fabricante')).toBe('referencia_fabricante_pedido')

    // Bug #1c — Tipo Linha != Tipo de Operacao
    expect(mapa.get('Tipo Linha')).toBe('tipo_linha')
    expect(mapa.get('Tipo de Operacao')).toBe('tipo_operacao')

    // Bug #2 — Numero do Pedido mapeia
    expect(mapa.get('Numero do Pedido')).toBe('numero_pedido')

    // Bug #4 (parcial) — campos numericos distintos nao colapsam
    expect(mapa.get('Valor Total do Pedido')).toBe('valor_total_pedido')
    expect(mapa.get('Valor Total do Item')).toBe('valor_total_item')
    expect(mapa.get('Valor Total Cambio')).toBe('valor_total_cambio_pedido')
    expect(mapa.get('Peso Bruto Total')).toBe('peso_bruto_total_pedido')
    expect(mapa.get('Peso Liquido Total')).toBe('peso_liquido_total_pedido')
    expect(mapa.get('Peso Liquido Unitario')).toBe('peso_liquido_unitario_item')
    expect(mapa.get('Cubagem Total')).toBe('cubagem_total_pedido')
    expect(mapa.get('Qtd. Pronta Total')).toBe('quantidade_pronta_total_item')

    // Bug #1d — Casas Decimais — Peso nao mapeia para peso_liquido_unitario
    expect(mapa.get('Casas Decimais — Peso')).toBe('casas_decimais_peso_item')
  })
})

