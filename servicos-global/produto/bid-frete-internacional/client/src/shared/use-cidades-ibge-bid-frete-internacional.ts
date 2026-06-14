import { useEffect, useState } from 'react'
import type { SelectOpcao } from '@nucleo/campo-select-global'

interface IbgeMunicipio {
  nome: string
}

const cidadesCache = new Map<string, SelectOpcao[]>()

export function useCidadesIbgeBidFreteInternacional(uf: string): {
  cidades: SelectOpcao[]
  carregando: boolean
} {
  const [cidades, setCidades] = useState<SelectOpcao[]>(() => cidadesCache.get(uf) ?? [])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!uf) {
      setCidades([])
      return
    }

    const cached = cidadesCache.get(uf)
    if (cached) {
      setCidades(cached)
      return
    }

    let cancelado = false
    setCarregando(true)

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(res => res.json())
      .then((data: IbgeMunicipio[]) => {
        if (cancelado) return
        const opcoes: SelectOpcao[] = data.map(c => ({ valor: c.nome, rotulo: c.nome }))
        opcoes.sort((a, b) => a.rotulo.localeCompare(b.rotulo))
        cidadesCache.set(uf, opcoes)
        setCidades(opcoes)
      })
      .catch(() => {
        if (!cancelado) setCidades([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => { cancelado = true }
  }, [uf])

  return { cidades, carregando }
}
