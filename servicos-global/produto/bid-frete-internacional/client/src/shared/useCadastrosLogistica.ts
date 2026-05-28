import { useEffect, useMemo, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import {
  cadastrosApi,
  rotuloContainerCadastro,
  type AeroportoCadastro,
  type ContainerCadastro,
  type PaisCadastro,
  type PortoCadastro,
} from './cadastrosApi'

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

export function usePortosPorPais(codigoPais: string, habilitado = true) {
  const [portos, setPortos] = useState<PortoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!habilitado) {
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
  }, [codigoPais, habilitado])

  const opcoes = useMemo((): SelectOpcao[] =>
    portos.map((p) => ({
      valor: p.codigo_unlocode_porto,
      rotulo: `${p.codigo_unlocode_porto} — ${p.nome_porto}`,
    })),
  [portos])

  return { portos, opcoes, carregando }
}

export function useAeroportosPorPais(codigoPais: string, habilitado = true) {
  const [aeroportos, setAeroportos] = useState<AeroportoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!habilitado) {
      setAeroportos([])
      return
    }
    let cancelado = false
    setCarregando(true)
    cadastrosApi
      .listarAeroportos({
        ...(codigoPais ? { pais: codigoPais } : {}),
        limit: 500,
      })
      .then((resp) => {
        if (!cancelado) setAeroportos(resp.itens)
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
  }, [codigoPais, habilitado])

  const opcoes = useMemo((): SelectOpcao[] =>
    aeroportos
      .filter((a) => a.codigo_iata_aeroporto)
      .map((a) => ({
        valor: a.codigo_iata_aeroporto as string,
        rotulo: `${a.codigo_iata_aeroporto} — ${a.nome_aeroporto}`,
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
