import { useEffect, useMemo, useState } from 'react'
import { carregarCatalogoAeroportosCadastros } from '@nucleo/catalogo-aeroportos-cadastros'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  cadastrosApi,
  rotuloContainerCadastro,
  type AeroportoCadastro,
  type ContainerCadastro,
  type PaisCadastro,
  type PortoCadastro,
  type MercadoriaPerigosaCadastro,
  rotuloMercadoriaPerigosaCadastro,
  type TaxaOrigemDestinoCadastro,
  type TipoTaxaOrigemDestino,
} from './cadastrosApi'
import {
  rotuloAeroportoCadastroLogistica,
  rotuloPortoCadastroLogistica,
} from '../../../shared/rotulo-cadastro-logistica-bid-frete-internacional'

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

/** Portos: `ativo` controla o modal; país é filtro opcional (lista completa sem país). */
export function usePortosPorPais(codigoPais: string, ativo = true) {
  const [portos, setPortos] = useState<PortoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!ativo) {
      setPortos([])
      return
    }
    let cancelado = false
    setCarregando(true)
    cadastrosApi
      .listarPortos({
        ...(codigoPais ? { pais: codigoPais } : {}),
        limit: 500,
      })
      .then((resp) => {
        if (!cancelado) setPortos(resp.itens)
      })
      .catch(() => {
        if (!cancelado) setPortos([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [codigoPais, ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    portos.map((p) => ({
      valor: p.codigo_unlocode_porto,
      rotulo: rotuloPortoCadastroLogistica(p),
    })),
  [portos])

  return { portos, opcoes, carregando }
}

/** Aeroportos: `ativo` controla o modal; país é filtro opcional (lista completa sem país). */
export function useAeroportosPorPais(codigoPais: string, ativo = true) {
  const [aeroportos, setAeroportos] = useState<AeroportoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!ativo) {
      setAeroportos([])
      return
    }
    let cancelado = false
    setCarregando(true)
    carregarCatalogoAeroportosCadastros(
      (p) => cadastrosApi.listarAeroportos(p),
      codigoPais,
    )
      .then((itens) => {
        if (!cancelado) setAeroportos(itens)
      })
      .catch(() => {
        if (!cancelado) setAeroportos([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [codigoPais, ativo])

  const opcoes = useMemo((): SelectOpcao[] =>
    aeroportos
      .filter((a) => a.codigo_iata_aeroporto)
      .map((a) => ({
        valor: a.codigo_iata_aeroporto as string,
        rotulo: rotuloAeroportoCadastroLogistica(a),
      })),
  [aeroportos])

  return { aeroportos, opcoes, carregando }
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
