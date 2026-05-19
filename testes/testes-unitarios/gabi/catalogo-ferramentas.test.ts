// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  buscarTool,
  listarToolsPorProduto,
  listarToolsPorClasse,
  isWriteTool,
  gerarGeminiDeclarations,
  filtrarToolsPorPermissao,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/catalogo-ferramentas.js'

describe('catalogo-ferramentas', () => {
  describe('buscarTool', () => {
    it('encontra tool existente por id', () => {
      const tool = buscarTool('pedido.listar')
      expect(tool).toBeDefined()
      expect(tool!.id).toBe('pedido.listar')
      expect(tool!.produto).toBe('pedido')
      expect(tool!.classe).toBe('READ')
    })

    it('retorna undefined para tool inexistente', () => {
      expect(buscarTool('nao.existe.isso')).toBeUndefined()
    })

    it('toda tool tem os campos obrigatorios', () => {
      const tool = buscarTool('pedido.listar')!
      expect(tool.id).toBeDefined()
      expect(tool.produto).toBeDefined()
      expect(tool.classe).toBeDefined()
      expect(tool.metodo).toBeDefined()
      expect(tool.endpoint).toBeDefined()
      expect(tool.descricao).toBeDefined()
      expect(tool.schema_params).toBeDefined()
      expect(tool.gemini_declaration).toBeDefined()
    })
  })

  describe('listarToolsPorProduto', () => {
    it('retorna tools do produto pedido', () => {
      const tools = listarToolsPorProduto('pedido')
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.every((t) => t.produto === 'pedido')).toBe(true)
    })

    it('retorna tools do produto configurador', () => {
      const tools = listarToolsPorProduto('configurador')
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.every((t) => t.produto === 'configurador')).toBe(true)
    })

    it('retorna array vazio para produto inexistente', () => {
      const tools = listarToolsPorProduto('inexistente')
      expect(tools).toHaveLength(0)
    })
  })

  describe('listarToolsPorClasse', () => {
    it('lista tools READ', () => {
      const tools = listarToolsPorClasse('READ')
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.every((t) => t.classe === 'READ')).toBe(true)
    })

    it('lista tools WRITE_SAFE', () => {
      const tools = listarToolsPorClasse('WRITE_SAFE')
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.every((t) => t.classe === 'WRITE_SAFE')).toBe(true)
    })

    it('lista tools WRITE_DESTRUTIVA', () => {
      const tools = listarToolsPorClasse('WRITE_DESTRUTIVA')
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.every((t) => t.classe === 'WRITE_DESTRUTIVA')).toBe(true)
    })
  })

  describe('isWriteTool', () => {
    it('retorna false para READ', () => {
      expect(isWriteTool('pedido.listar')).toBe(false)
    })

    it('retorna true para WRITE_SAFE', () => {
      expect(isWriteTool('pedido.criar')).toBe(true)
    })

    it('retorna false para tool inexistente', () => {
      expect(isWriteTool('nao.existe')).toBe(false)
    })
  })

  describe('gerarGeminiDeclarations', () => {
    it('gera declarations para todas as tools', () => {
      const declarations = gerarGeminiDeclarations()
      expect(declarations).toHaveLength(1)
      const decl = declarations[0] as { functionDeclarations: unknown[] }
      expect(decl.functionDeclarations.length).toBeGreaterThan(10)
    })

    it('filtra por toolIds quando fornecido', () => {
      const declarations = gerarGeminiDeclarations(['pedido.listar', 'pedido.detalhar'])
      const decl = declarations[0] as { functionDeclarations: unknown[] }
      expect(decl.functionDeclarations).toHaveLength(2)
    })

    it('toda declaration tem name e description', () => {
      const declarations = gerarGeminiDeclarations(['pedido.listar'])
      const decl = declarations[0] as { functionDeclarations: Array<{ name: string; description: string }> }
      expect(decl.functionDeclarations[0].name).toBe('pedido_listar')
      expect(decl.functionDeclarations[0].description).toBeDefined()
    })
  })

  describe('filtrarToolsPorPermissao', () => {
    it('SUPER_ADMIN ve todas as tools', () => {
      const all = filtrarToolsPorPermissao('SUPER_ADMIN')
      const noFilter = gerarGeminiDeclarations()
      const totalDecl = (noFilter[0] as { functionDeclarations: unknown[] }).functionDeclarations.length
      expect(all.length).toBe(totalDecl)
    })

    it('FORNECEDOR nao ve tools com permissao_minima PADRAO ou superior', () => {
      const tools = filtrarToolsPorPermissao('FORNECEDOR')
      const temRestrita = tools.some((t) => {
        if (!t.permissao_minima) return false
        const nivel: Record<string, number> = { SUPER_ADMIN: 5, ADMIN: 4, MASTER: 3, PADRAO: 2, FORNECEDOR: 1 }
        return (nivel[t.permissao_minima] ?? 0) > 1
      })
      expect(temRestrita).toBe(false)
    })

    it('filtra subset quando toolIds fornecido', () => {
      const tools = filtrarToolsPorPermissao('PADRAO', ['pedido.listar', 'pedido.criar'])
      expect(tools.length).toBeLessThanOrEqual(2)
    })
  })

  describe('integridade do catalogo', () => {
    it('todo endpoint comeca com /api/', () => {
      const reads = listarToolsPorClasse('READ')
      const writes = listarToolsPorClasse('WRITE_SAFE')
      const destrutivas = listarToolsPorClasse('WRITE_DESTRUTIVA')
      const todas = [...reads, ...writes, ...destrutivas]
      for (const t of todas) {
        expect(t.endpoint).toMatch(/^\/api\//)
      }
    })

    it('todo id segue padrao produto.acao', () => {
      const tools = listarToolsPorClasse('READ')
      for (const t of tools) {
        expect(t.id).toMatch(/^[a-z]+\.[a-z_]+$/)
      }
    })

    it('toda tool READ usa metodo GET ou POST', () => {
      const tools = listarToolsPorClasse('READ')
      for (const t of tools) {
        expect(['GET', 'POST']).toContain(t.metodo)
      }
    })

    it('gemini_declaration.name corresponde ao id da tool', () => {
      const tool = buscarTool('pedido.listar')!
      expect(tool.gemini_declaration.name).toBe(tool.id)
    })
  })
})
