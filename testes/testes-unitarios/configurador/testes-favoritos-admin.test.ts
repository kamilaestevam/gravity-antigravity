import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  adicionarTesteFavoritoAdmin,
  chaveTesteFavoritoAdmin,
  extrairDescricaoPlanoTeste,
  extrairTituloPlanoTeste,
  lerTestesFavoritosAdmin,
  montarResumoPlanosFavorito,
  planosExibicaoFavorito,
  removerTesteFavoritoAdmin,
  rotuloTesteFavoritoAdmin,
  type TesteFavoritoAdmin,
} from '@testes/infra/admin/testes-favoritos-admin'

const ID_USUARIO = 'usr-teste-favoritos'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => { storage.set(key, value) },
    removeItem: (key: string) => { storage.delete(key) },
    clear: () => { storage.clear() },
  })
})

const favoritoBase: TesteFavoritoAdmin = {
  produto: 'pedido',
  ambiente: 'Producao',
  tipos: ['EMT'],
  planos_ids: ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001'],
}

afterEach(() => {
  storage.clear()
  vi.unstubAllGlobals()
})

describe('testes-favoritos-admin', () => {
  it('adiciona e lê favorito persistido', () => {
    const res = adicionarTesteFavoritoAdmin(ID_USUARIO, favoritoBase)
    expect(res.adicionado).toBe(true)
    expect(lerTestesFavoritosAdmin(ID_USUARIO)).toHaveLength(1)
  })

  it('rejeita duplicata com mesma chave', () => {
    adicionarTesteFavoritoAdmin(ID_USUARIO, favoritoBase)
    const res = adicionarTesteFavoritoAdmin(ID_USUARIO, {
      ...favoritoBase,
      planos_ids: [...favoritoBase.planos_ids],
    })
    expect(res.adicionado).toBe(false)
    expect(res.motivo).toBe('duplicado')
  })

  it('remove favorito por índice', () => {
    adicionarTesteFavoritoAdmin(ID_USUARIO, favoritoBase)
    const lista = removerTesteFavoritoAdmin(ID_USUARIO, 0)
    expect(lista).toHaveLength(0)
    expect(lerTestesFavoritosAdmin(ID_USUARIO)).toHaveLength(0)
  })

  it('monta rótulo legível', () => {
    expect(rotuloTesteFavoritoAdmin(favoritoBase, 'Pedido')).toBe(
      'Pedido · Produção · EMT · 1 plano',
    )
  })

  it('extrai título e descrição do plano como na lista', () => {
    const origem = {
      id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001',
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
      ['TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001'],
      [{
        id: 'TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001',
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
    const fav: TesteFavoritoAdmin = {
      ...favoritoBase,
      planos_resumo: [{
        id: favoritoBase.planos_ids[0],
        titulo: 'Título completo do plano',
        descricao: 'lista/editar-salvar · 92 casos no registry',
        tipo: 'EMT',
      }],
    }
    const exibicao = planosExibicaoFavorito(fav)
    expect(exibicao[0]?.titulo).toBe('Título completo do plano')
    expect(exibicao[0]?.descricao).toContain('lista/editar-salvar')
  })

  it('chave ignora ordem de tipos e planos', () => {
    const a = chaveTesteFavoritoAdmin({
      produto: 'admin',
      ambiente: 'Local',
      tipos: ['UNI', 'FUN'],
      planos_ids: ['TST-A', 'TST-B'],
    })
    const b = chaveTesteFavoritoAdmin({
      produto: 'admin',
      ambiente: 'Local',
      tipos: ['FUN', 'UNI'],
      planos_ids: ['TST-B', 'TST-A'],
    })
    expect(a).toBe(b)
  })
})
