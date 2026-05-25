// TST-FUNC-NUC-CAL-001 — calendário em modal usa portal + fixed (evita overflow:hidden)
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '../../..')

function lerArquivo(caminho: string): string {
  return readFileSync(resolve(ROOT, caminho), 'utf-8')
}

describe('CampoCalendarioGlobal — painel em modal', () => {
  it('deve renderizar painel via createPortal no document.body', () => {
    const conteudo = lerArquivo(
      'nucleo-global/Campos/campo-calendario-global/src/CampoCalendarioGlobal.tsx',
    )
    expect(conteudo).toContain("createPortal(renderPanel(), document.body)")
  })

  it('deve posicionar painel flutuante com position fixed e z-index acima do modal', () => {
    const conteudo = lerArquivo(
      'nucleo-global/Campos/campo-calendario-global/src/CampoCalendarioGlobal.tsx',
    )
    expect(conteudo).toContain("position: 'fixed'")
    expect(conteudo).toContain('zIndex: 10001')
  })
})
