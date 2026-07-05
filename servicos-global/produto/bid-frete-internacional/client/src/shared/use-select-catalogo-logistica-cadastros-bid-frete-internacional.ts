/**
 * Catálogo portos/aeroportos com busca remota no Cadastros (lista total via ?q=).
 * Preview parcial ao abrir; render limitado no SelectGlobal.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_CATALOGO_LOGISTICA_GLOBAL_BID,
  LIMITE_CATALOGO_LOGISTICA_POR_PAIS_BID,
  LIMITE_RENDER_OPCOES_SELECT_CATALOGO_LOGISTICA_BID,
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
}

export function useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
  tipo,
  codigoPais = '',
  ativo = true,
  codigoSelecionado = null,
}: ParamsSelectCatalogoLogistica) {
  const [itens, setItens] = useState<(PortoCadastro | AeroportoCadastro)[]>([])
  const [totalCatalogo, setTotalCatalogo] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [aguardandoMinimoBusca, setAguardandoMinimoBusca] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reqIdRef = useRef(0)

  const paisFiltro = codigoPais?.trim().toUpperCase()
  const paisParam = paisFiltro && paisFiltro.length === 2 ? paisFiltro : undefined

  const buscar = useCallback(
    async (termo: string) => {
      if (!ativo) return
      const busca = termo.trim()
      const id = ++reqIdRef.current
      setCarregando(true)
      try {
        const params = {
          ...(paisParam ? { pais: paisParam } : {}),
          ...(busca.length >= MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID
            ? { q: busca, limit: LIMITE_BUSCA_CATALOGO_LOGISTICA_BID }
            : {
                limit: paisParam
                  ? LIMITE_CATALOGO_LOGISTICA_POR_PAIS_BID
                  : LIMITE_CATALOGO_LOGISTICA_GLOBAL_BID,
              }),
        }
        const resp =
          tipo === 'porto'
            ? await cadastrosApi.listarPortos(params)
            : await cadastrosApi.listarAeroportos(params)
        if (id !== reqIdRef.current) return
        setItens(resp.itens)
        setTotalCatalogo(resp.total)
      } catch {
        if (id !== reqIdRef.current) return
        setItens([])
        setTotalCatalogo(0)
      } finally {
        if (id === reqIdRef.current) {
          setCarregando(false)
          setAguardandoMinimoBusca(false)
        }
      }
    },
    [ativo, paisParam, tipo],
  )

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

  useEffect(() => {
    if (!ativo || !codigoSelecionado?.trim()) return
    let cancelado = false
    void garantirSelecionado(codigoSelecionado.trim()).then((item) => {
      if (cancelado || !item) return
      setItens((prev) => {
        if (tipo === 'porto') {
          const porto = item as PortoCadastro
          if (prev.some((p) => (p as PortoCadastro).codigo_unlocode_porto === porto.codigo_unlocode_porto)) {
            return prev
          }
          return [porto, ...prev]
        }
        const aeroporto = item as AeroportoCadastro
        const codigo = aeroporto.codigo_iata_aeroporto ?? aeroporto.codigo_unlocode_aeroporto
        if (
          prev.some(
            (a) =>
              (a as AeroportoCadastro).codigo_iata_aeroporto === codigo ||
              (a as AeroportoCadastro).codigo_unlocode_aeroporto === codigo,
          )
        ) {
          return prev
        }
        return [aeroporto, ...prev]
      })
    })
    return () => {
      cancelado = true
    }
  }, [ativo, codigoSelecionado, garantirSelecionado, tipo])

  useEffect(() => {
    if (!ativo) {
      setItens([])
      setTotalCatalogo(0)
      return
    }
    void buscar('')
  }, [ativo, paisParam, buscar])

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
        void buscar(termo)
      }, DEBOUNCE_MS_BUSCA_CATALOGO_LOGISTICA_BID)
    },
    [ativo, buscar],
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

  const mensagemListaVazia =
    aguardandoMinimoBusca && !carregando
      ? `Digite ao menos ${MIN_CARACTERES_BUSCA_CATALOGO_LOGISTICA_BID} caracteres para buscar no catálogo completo.`
      : undefined

  return {
    portos: tipo === 'porto' ? (itens as PortoCadastro[]) : [],
    aeroportos: tipo === 'aeroporto' ? (itens as AeroportoCadastro[]) : [],
    opcoes,
    carregando,
    totalCatalogo,
    aoMudarBusca,
    limiteOpcoesRenderizadas:
      totalCatalogo > LIMITE_RENDER_OPCOES_SELECT_CATALOGO_LOGISTICA_BID
        ? LIMITE_RENDER_OPCOES_SELECT_CATALOGO_LOGISTICA_BID
        : undefined,
    mensagemListaVazia,
  }
}

export function usePortosPorPais(
  codigoPais: string,
  ativo = true,
  codigoSelecionado?: string | null,
) {
  return useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
    tipo: 'porto',
    codigoPais,
    ativo,
    codigoSelecionado,
  })
}

export function useAeroportosPorPais(
  codigoPais: string,
  ativo = true,
  codigoSelecionado?: string | null,
) {
  return useSelectCatalogoLogisticaCadastrosBidFreteInternacional({
    tipo: 'aeroporto',
    codigoPais,
    ativo,
    codigoSelecionado,
  })
}
