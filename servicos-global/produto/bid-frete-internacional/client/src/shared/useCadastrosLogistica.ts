import { useEffect, useMemo, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'
import { cadastrosApi, type AeroportoCadastro, type PaisCadastro, type PortoCadastro } from './cadastrosApi'

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

export function usePortosPorPais(codigoPais: string) {
  const [portos, setPortos] = useState<PortoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!codigoPais) {
      setPortos([])
      return
    }
    let ativo = true
    setCarregando(true)
    cadastrosApi
      .listarPortos({ pais: codigoPais, limit: 500 })
      .then((resp) => {
        if (ativo) setPortos(resp.itens)
      })
      .catch(() => {
        if (ativo) setPortos([])
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [codigoPais])

  const opcoes = useMemo((): SelectOpcao[] =>
    portos.map((p) => ({
      valor: p.codigo_unlocode_porto,
      rotulo: `${p.codigo_unlocode_porto} — ${p.nome_porto}`,
    })),
  [portos])

  return { portos, opcoes, carregando }
}

export function useAeroportosPorPais(codigoPais: string) {
  const [aeroportos, setAeroportos] = useState<AeroportoCadastro[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!codigoPais) {
      setAeroportos([])
      return
    }
    let ativo = true
    setCarregando(true)
    cadastrosApi
      .listarAeroportos({ pais: codigoPais, limit: 500 })
      .then((resp) => {
        if (ativo) setAeroportos(resp.itens)
      })
      .catch(() => {
        if (ativo) setAeroportos([])
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [codigoPais])

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
