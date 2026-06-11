// TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091
// Unitário do domínio puro de Preferência de Teste do Usuário (favoritos do modal "Rodar Testes").
// Escopo: testes/infra/admin/testes-favoritos-admin.ts (contratos Zod, rótulos, snapshot, deduplicação).
import { describe, expect, it } from 'vitest'
import {
  chaveTesteFavoritoUsuario,
  extrairDescricaoPlanoTeste,
  extrairTituloPlanoTeste,
  montarResumoPlanosFavorito,
  planosExibicaoFavorito,
  resolverOqueFoiTestadoLog,
  resolverOqueFoiTestadoPlano,
  rotuloTesteFavoritoUsuario,
  testeFavoritoUsuarioSchema,
  type TesteFavoritoUsuario,
} from '@testes/infra/admin/testes-favoritos-admin'

const favoritoBase: TesteFavoritoUsuario = {
  produto_teste_favorito_usuario: 'pedido',
  ambiente_teste_favorito_usuario: 'Producao',
  tipos_teste_favorito_usuario: ['EMT'],
  planos_ids_teste_favorito_usuario: ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'],
}

describe('TST-UNI-PREFERENCIA-TESTE-USUARIO-ADMIN-000091', () => {
  it('valida favorito contra o schema (paridade com a tabela)', () => {
    const parsed = testeFavoritoUsuarioSchema.safeParse({
      id_teste_favorito_usuario: 'cabc123',
      produto_teste_favorito_usuario: 'admin',
      ambiente_teste_favorito_usuario: 'Local',
      tipos_teste_favorito_usuario: ['UNI'],
      planos_ids_teste_favorito_usuario: ['TST-UNI-ADMIN-000021'],
      planos_resumo_teste_favorito_usuario: null,
      data_criacao_teste_favorito_usuario: '2026-06-11T17:00:00.000Z',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejeita favorito sem tipos', () => {
    const parsed = testeFavoritoUsuarioSchema.safeParse({
      ...favoritoBase,
      tipos_teste_favorito_usuario: [],
    })
    expect(parsed.success).toBe(false)
  })

  it('rejeita produto fora do enum', () => {
    const parsed = testeFavoritoUsuarioSchema.safeParse({
      ...favoritoBase,
      produto_teste_favorito_usuario: 'inexistente',
    })
    expect(parsed.success).toBe(false)
  })

  it('monta rótulo legível', () => {
    expect(rotuloTesteFavoritoUsuario(favoritoBase, 'Pedido')).toBe(
      'Pedido · Produção · EMT · 1 plano',
    )
  })

  it('extrai título e descrição do plano como na lista', () => {
    const origem = {
      id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045',
      modulo: 'Edição e Salvar pedidos e itens (Nº PEDIDO + TIPO OP.)',
      sublocal: 'lista/editar-salvar',
      tipo: 'EMT',
      casosTotal: 92,
    }
    expect(extrairTituloPlanoTeste(origem)).toBe(origem.modulo)
    expect(extrairDescricaoPlanoTeste(origem)).toBe('lista/editar-salvar · 92 casos no registry')
  })

  it('monta resumo de planos para favorito com snapshot', () => {
    const resumo = montarResumoPlanosFavorito(
      ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045'],
      [{
        id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045',
        modulo: 'Edição e Salvar pedidos e itens',
        sublocal: 'lista/editar-salvar',
        tipo: 'EMT',
        casosTotal: 92,
      }],
    )
    expect(resumo[0]?.titulo).toBe('Edição e Salvar pedidos e itens')
    expect(resumo[0]?.descricao).toContain('lista/editar-salvar')
    expect(resumo[0]?.tipo).toBe('EMT')
  })

  it('planosExibicaoFavorito prioriza planos_resumo persistido', () => {
    const fav: TesteFavoritoUsuario = {
      ...favoritoBase,
      planos_resumo_teste_favorito_usuario: [{
        id: favoritoBase.planos_ids_teste_favorito_usuario[0],
        titulo: 'Título completo do plano',
        descricao: 'lista/editar-salvar · 92 casos no registry',
        tipo: 'EMT',
      }],
    }
    const exibicao = planosExibicaoFavorito(fav)
    expect(exibicao[0]?.titulo).toBe('Título completo do plano')
    expect(exibicao[0]?.descricao).toContain('lista/editar-salvar')
  })

  it('planosExibicaoFavorito trata planos_resumo nulo (coluna Json vazia)', () => {
    const fav: TesteFavoritoUsuario = {
      ...favoritoBase,
      planos_resumo_teste_favorito_usuario: null,
    }
    const exibicao = planosExibicaoFavorito(fav)
    expect(exibicao).toHaveLength(1)
    expect(exibicao[0]?.id).toBe(favoritoBase.planos_ids_teste_favorito_usuario[0])
  })

  it('resolverOqueFoiTestadoPlano usa subtitulo (modulo) e cai no id se vazio', () => {
    expect(resolverOqueFoiTestadoPlano({
      id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045',
      modulo: 'Edição e Salvar pedidos e itens (NCM)',
    })).toBe('Edição e Salvar pedidos e itens (NCM)')
    expect(resolverOqueFoiTestadoPlano({
      id: 'TST-UNI-ADMIN-000021',
    })).toBe('TST-UNI-ADMIN-000021')
  })

  it('resolverOqueFoiTestadoLog resolve ID legado via catálogo', () => {
    const catalogo = new Map([
      ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045', {
        id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045',
        sublocal: 'lista/editar-salvar',
        modulo: 'Edição e Salvar pedidos e itens (NCM)',
      }],
    ])
    expect(resolverOqueFoiTestadoLog(
      'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045',
      'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001',
      catalogo,
    )).toBe('Edição e Salvar pedidos e itens (NCM)')
  })

  it('chave de deduplicação ignora ordem de tipos e planos', () => {
    const a = chaveTesteFavoritoUsuario({
      produto_teste_favorito_usuario: 'admin',
      ambiente_teste_favorito_usuario: 'Local',
      tipos_teste_favorito_usuario: ['UNI', 'FUN'],
      planos_ids_teste_favorito_usuario: ['TST-A', 'TST-B'],
    })
    const b = chaveTesteFavoritoUsuario({
      produto_teste_favorito_usuario: 'admin',
      ambiente_teste_favorito_usuario: 'Local',
      tipos_teste_favorito_usuario: ['FUN', 'UNI'],
      planos_ids_teste_favorito_usuario: ['TST-B', 'TST-A'],
    })
    expect(a).toBe(b)
  })
})
