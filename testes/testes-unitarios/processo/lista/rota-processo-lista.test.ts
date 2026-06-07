import { describe, expect, it } from 'vitest'
import {
  rotaDetalheProcessoLista,
  rotaSubpaginaProcessoLista,
  slugProcessoLista,
} from '../../../../servicos-global/produto/processo/client/src/shared/lista/rotaProcessoLista'

describe('rotaProcessoLista', () => {
  const processo = {
    id_processo: 'p1',
    id_organizacao: 'org_mock',
    numero_processo: 'IMP-2026/0150',
  }

  it('slugProcessoLista normaliza número IMP', () => {
    expect(slugProcessoLista('IMP-2026/0150')).toBe('processo-20260150')
  })

  it('rotaDetalheProcessoLista usa /processo/detalhe/workflow com query', () => {
    expect(rotaDetalheProcessoLista(processo)).toBe(
      '/processo/detalhe/workflow?id=p1&idOrganizacao=org_mock',
    )
  })

  it('rotaSubpaginaProcessoLista monta pedidos/resumo', () => {
    expect(rotaSubpaginaProcessoLista(processo, 'pedidos/resumo')).toBe(
      '/processo/detalhe/pedidos/resumo?id=p1&idOrganizacao=org_mock',
    )
  })
})
