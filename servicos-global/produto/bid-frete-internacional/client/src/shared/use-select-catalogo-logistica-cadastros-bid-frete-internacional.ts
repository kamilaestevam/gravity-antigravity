/**
 * Catálogo portos/aeroportos — paginação por scroll + busca remota indexada.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_CATALOGO_LOGISTICA_POR_PAIS_BID,
  LIMITE_PAGINA_CATALOGO_LOGISTICA_BID,
  MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID,
} from '../../../shared/limites-catalogo-logistica-bid-frete-internacional'
import {
  rotuloAeroportoCadastroLogistica,
  rotuloPortoCadastroLogistica,
} from '../../../shared/rotulo-cadastro-logistica-bid-frete-internacional'
import {
  cadastrosApi,
  type AeroportoCadastro,
  type PortoCadastro,
} from './cadastrosApi'

type TipoCatalogoLogistica = 'porto' | 'aeroporto'

interface ParamsSelectCatalogoLogistica {
  tipo: TipoCatalogoLogistica
  codigoPais?: string
  ativo?: boolean
  codigoSelecionado?: string | null
  /** Códigos extras a garantir na lista (ex.: locais adicionais aceitos) — mesmo pin do selecionado principal. */
  codigosSelecionados?: string[]
}

function mesclarPortos(prev: PortoCadastro[], novos: PortoCadastro[]): PortoCadastro[] {
  const map = new Map(prev.map((p) => [p.codigo_unlocode_porto, p]))
  for (const p of novos) map.set(p.codigo_unlocode_porto, p)
  return Array.from(map.values())
}

function mesclarAeroportos(prev: AeroportoCadastro[], novos: AeroportoCadastro[]): AeroportoCadastro[] {
  const chave = (a: AeroportoCadastro) => a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto
  const map = new Map(prev.map((a) => [chave(a), a]))
  for (const a of novos) map.set(chave(a), a)
  return Array.from(map.values())
}

function codigoDeItemCatalogo(
  tipo: TipoCatalogoLogistica,
  item: PortoCadastro | AeroportoCadastro,
): string {
  if (tipo === 'porto') return (item as PortoCadastro).codigo_unlocode_porto
  const a = item as AeroportoCadastro
  return a.codigo_iata_aeroporto ?? a.codigo_unlocode_aeroporto
}

export function useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
  tipo,
  codigoPais = '',
  ativo = true,
  codigoSelecionado = null,
  codigosSelecionados,
}: ParamsSelectCatalogoLogistica) {
  const [itens, setItens] = useState<(PortoCadastro | AeroportoCadastro)[]>([])
  const [totalCatalogo, setTotalCatalogo] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [aguardandoMinimoBusca, setAguardandoMinimoBusca] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)
  const offsetRef = useRef(0)
  const termoBuscaRef = useRef('')
  // Itens selecionados fixados ("pin"): o snapshot de rota no submit deriva nome/país
  // desta lista em memória. Sem o pin, uma nova página/busca substituiria a lista
  // e o item selecionado sumiria — o nome gravado viraria o próprio código
  // (ex.: «Nome gravado (BRSSZ) não corresponde ao Cadastros (Santos)»).
  // Map código→item: suporta o selecionado principal e os locais adicionais aceitos.
  const itensSelecionadosRef = useRef(new Map<string, PortoCadastro | AeroportoCadastro>())

  const paisFiltro = codigoPais?.trim().toUpperCase()
  const paisParam = paisFiltro && paisFiltro.length === 2 ? paisFiltro : undefined

  const incluirItemSelecionado = useCallback(
    (lista: (PortoCadastro | AeroportoCadastro)[]): (PortoCadastro | AeroportoCadastro)[] => {
      if (itensSelecionadosRef.current.size === 0) return lista
      const codigosNaLista = new Set(lista.map((i) => codigoDeItemCatalogo(tipo, i)))
      const faltantes = Array.from(itensSelecionadosRef.current.values()).filter(
        (item) => !codigosNaLista.has(codigoDeItemCatalogo(tipo, item)),
      )
      return faltantes.length > 0 ? [...faltantes, ...lista] : lista
    },
    [tipo],
  )

  const buscarPagina = useCallback(
    async (termo: string, offset: number, append: boolean) => {
      if (!ativo) return
      const busca = termo.trim()
      const id = ++reqIdRef.current
      if (append) setCarregandoMais(true)
      else setCarregando(true)

      try {
        const emBusca = busca.length >= MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID
        const params = {
          ...(paisParam ? { pais: paisParam } : {}),
          ...(emBusca
            ? { q: busca, limit: LIMITE_BUSCA_CATALOGO_LOGISTICA_BID, offset: 0 }
            : {
                limit: paisParam
                  ? LIMITE_CATALOGO_LOGISTICA_POR_PAIS_BID
                  : LIMITE_PAGINA_CATALOGO_LOGISTICA_BID,
                offset,
              }),
        }
        const resp =
          tipo === 'porto'
            ? await cadastrosApi.listarPortos(params)
            : await cadastrosApi.listarAeroportos(params)
        if (id !== reqIdRef.current) return

        setTotalCatalogo(resp.total)
        setItens((prev) => {
          const base =
            !append || emBusca
              ? resp.itens
              : tipo === 'porto'
                ? mesclarPortos(prev as PortoCadastro[], resp.itens as PortoCadastro[])
                : mesclarAeroportos(prev as AeroportoCadastro[], resp.itens as AeroportoCadastro[])
          return incluirItemSelecionado(base)
        })
        offsetRef.current = emBusca ? 0 : offset + resp.itens.length
        termoBuscaRef.current = busca
      } catch {
        if (id !== reqIdRef.current) return
        if (!append) {
          setItens([])
          setTotalCatalogo(0)
        }
      } finally {
        if (id === reqIdRef.current) {
          setCarregando(false)
          setCarregandoMais(false)
          setAguardandoMinimoBusca(false)
        }
      }
    },
    [ativo, incluirItemSelecionado, paisParam, tipo],
  )

  const reiniciarBusca = useCallback(
    (termo: string) => {
      offsetRef.current = 0
      void buscarPagina(termo, 0, false)
    },
    [buscarPagina],
  )

  const carregarMais = useCallback(() => {
    if (!ativo || carregando || carregandoMais) return
    if (termoBuscaRef.current.trim().length >= MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID) return
    if (itens.length >= totalCatalogo) return
    void buscarPagina(termoBuscaRef.current, offsetRef.current, true)
  }, [ativo, buscarPagina, carregando, carregandoMais, itens.length, totalCatalogo])

  const garantirSelecionado = useCallback(
    async (codigo: string) => {
      const params = {
        q: codigo,
        limit: 5,
        ...(paisParam ? { pais: paisParam } : {}),
      }
      const resp =
        tipo === 'porto'
          ? await cadastrosApi.listarPortos(params)
          : await cadastrosApi.listarAeroportos(params)
      if (tipo === 'porto') {
        return resp.itens.find((p) => p.codigo_unlocode_porto === codigo) ?? null
      }
      return (
        resp.itens.find(
          (a) =>
            a.codigo_iata_aeroporto === codigo || a.codigo_unlocode_aeroporto === codigo,
        ) ?? null
      )
    },
    [paisParam, tipo],
  )

  // Chave estável dos códigos a garantir (principal + adicionais) — evita refetch
  // a cada render quando o array é recriado com o mesmo conteúdo.
  const chaveCodigosSelecionados = useMemo(() => {
    const codigos = new Set<string>()
    if (codigoSelecionado?.trim()) codigos.add(codigoSelecionado.trim())
    for (const c of codigosSelecionados ?? []) {
      if (c?.trim()) codigos.add(c.trim())
    }
    return Array.from(codigos).sort().join('|')
  }, [codigoSelecionado, codigosSelecionados])

  useEffect(() => {
    if (!ativo || !chaveCodigosSelecionados) {
      itensSelecionadosRef.current.clear()
      return
    }
    const codigos = chaveCodigosSelecionados.split('|')
    const codigosSet = new Set(codigos)
    for (const fixado of Array.from(itensSelecionadosRef.current.keys())) {
      if (!codigosSet.has(fixado)) itensSelecionadosRef.current.delete(fixado)
    }
    const faltantes = codigos.filter((c) => !itensSelecionadosRef.current.has(c))
    if (faltantes.length === 0) return

    let cancelado = false
    void Promise.all(faltantes.map((codigo) => garantirSelecionado(codigo))).then((itensGarantidos) => {
      if (cancelado) return
      let algumNovo = false
      itensGarantidos.forEach((item, i) => {
        if (!item) return
        itensSelecionadosRef.current.set(faltantes[i], item)
        algumNovo = true
      })
      if (algumNovo) setItens((prev) => incluirItemSelecionado(prev))
    })
    return () => {
      cancelado = true
    }
  }, [ativo, chaveCodigosSelecionados, garantirSelecionado, incluirItemSelecionado, tipo])

  useEffect(() => {
    if (!ativo) {
      setItens([])
      setTotalCatalogo(0)
      offsetRef.current = 0
      termoBuscaRef.current = ''
      return
    }
    reiniciarBusca('')
  }, [ativo, paisParam, reiniciarBusca])

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const aoMudarBusca = useCallback(
    (termo: string) => {
      if (!ativo) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      const busca = termo.trim()
      if (busca.length === 1) {
        setAguardandoMinimoBusca(true)
        return
      }
      setAguardandoMinimoBusca(false)
      debounceRef.current = setTimeout(() => {
        reiniciarBusca(termo)
      }, DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID)
    },
    [ativo, reiniciarBusca],
  )

  const opcoes = useMemo((): SelectOpcao[] => {
    if (tipo === 'porto') {
      return (itens as PortoCadastro[]).map((p) => ({
        valor: p.codigo_unlocode_porto,
        rotulo: rotuloPortoCadastroLogistica(p),
      }))
    }
    return (itens as AeroportoCadastro[])
      .filter((a) => a.codigo_iata_aeroporto)
      .map((a) => ({
        valor: a.codigo_iata_aeroporto as string,
        rotulo: rotuloAeroportoCadastroLogistica(a),
      }))
  }, [itens, tipo])

  const temMaisItens =
    termoBuscaRef.current.trim().length < MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID &&
    itens.length < totalCatalogo

  const mensagemListaVazia =
    aguardandoMinimoBusca && !carregando
      ? `Digite ao menos ${MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID} caracteres para buscar no catálogo completo.`
      : undefined

  return {
    portos: tipo === 'porto' ? (itens as PortoCadastro[]) : [],
    aeroportos: tipo === 'aeroporto' ? (itens as AeroportoCadastro[]) : [],
    opcoes,
    carregando: carregando || carregandoMais,
    totalCatalogo,
    temMaisItens,
    aoMudarBusca,
    aoScrollFimLista: carregarMais,
    mensagemListaVazia,
  }
}

export function usePortosPorPais(
  codigoPais: string,
  ativo = true,
  codigoSelecionado?: string | null,
  codigosSelecionados?: string[],
) {
  return useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
    tipo: 'porto',
    codigoPais,
    ativo,
    codigoSelecionado,
    codigosSelecionados,
  })
}

export function useAeroportosPorPais(
  codigoPais: string,
  ativo = true,
  codigoSelecionado?: string | null,
  codigosSelecionados?: string[],
) {
  return useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
    tipo: 'aeroporto',
    codigoPais,
    ativo,
    codigosSelecionados,
    codigoSelecionado,
  })
}
