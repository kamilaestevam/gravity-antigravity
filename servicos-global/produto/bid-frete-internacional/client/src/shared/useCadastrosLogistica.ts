import { useEffect, useMemo, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  cadastrosApi,
  rotuloContainerCadastro,
  type ContainerCadastro,
  type PaisCadastro,
  type MercadoriaPerigosaCadastro,
  rotuloMercadoriaPerigosaCadastro,
  type TaxaOrigemDestinoCadastro,
  type TipoTaxaOrigemDestino,
} from './cadastrosApi'
import { filtrarTaxasCatalogoNaoLegado } from './taxas-linha-proposta-bid-frete-internacional'

export {
  usePortosPorPais,
  useAeroportosPorPais,
} from './use-select-catalogo-logistica-cadastros-bid-frete-internacional'

export function usePaisesCadastros() {
  const [paises, setPaises] = useState<PaisCadastro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    cadastrosApi
      .listarPaises()
      .then((resp) => {
        if (ativo) setPaises(resp.itens)
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar países')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const opcoes = useMemo((): SelectOpcao[] =>
    paises
      .filter((p) => p.codigo_pais_iso_alpha2)
      .map((p) => ({
        valor: p.codigo_pais_iso_alpha2,
        rotulo: `${p.nome_pais_portugues} (${p.codigo_pais_iso_alpha2})`,
      })),
  [paises])

  return { paises, opcoes, carregando, erro }
}

export function useContainersCadastros(ativo = true) {
  const [containers, setContainers] = useState<ContainerCadastro[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!ativo) {
      setContainers([])
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    cadastrosApi
      .listarContainers({ limit: 500 })
      .then((resp) => {
        if (!cancelado) setContainers(resp.itens)
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setContainers([])
          setErro(e instanceof Error ? e.message : 'Erro ao carregar containers')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    containers
      .filter((c) => c.codigo_iso_container)
      .map((c) => ({
        valor: c.codigo_iso_container as string,
        rotulo: `${c.codigo_iso_container} — ${rotuloContainerCadastro(c)}`,
      })),
  [containers])

  return { containers, opcoes, carregando, erro }
}

export function useTaxasOrigemDestinoCadastros(tipo?: TipoTaxaOrigemDestino, ativo = true) {
  const [taxas, setTaxas] = useState<TaxaOrigemDestinoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!ativo) {
      setTaxas([])
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    cadastrosApi
      .listarTaxasOrigemDestino({ ...(tipo ? { tipo } : {}), limit: 500 })
      .then((resp) => {
        if (!cancelado) setTaxas(filtrarTaxasCatalogoNaoLegado(resp.itens))
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setTaxas([])
          setErro(e instanceof Error ? e.message : 'Erro ao carregar taxas')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [tipo, ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    taxas.map((t) => ({
      valor: t.id_taxa_origem_destino,
      rotulo: t.nome_taxa_origem_destino,
    })),
  [taxas])

  return { taxas, opcoes, carregando, erro }
}

export function useMercadoriasPerigosasCadastros(ativo = true) {
  const [mercadorias, setMercadorias] = useState<MercadoriaPerigosaCadastro[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!ativo) {
      setMercadorias([])
      return
    }
    let cancelado = false
    setCarregando(true)
    setErro(null)
    cadastrosApi
      .listarMercadoriasPerigosas({ limit: 500 })
      .then((resp) => {
        if (!cancelado) setMercadorias(resp.itens)
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setMercadorias([])
          setErro(e instanceof Error ? e.message : 'Erro ao carregar mercadorias perigosas')
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    mercadorias.map((m) => ({
      valor: m.id_mercadoria_perigosa,
      rotulo: rotuloMercadoriaPerigosaCadastro(m),
    })),
  [mercadorias])

  return { mercadorias, opcoes, carregando, erro }
}
