/**
 * Catálogos Cadastros para edição inline na lista BID Frete — paridade com Pedido (useLogisticaCadastrosPedido).
 */
import { useEffect, useMemo, useState } from 'react'
import {
  cadastrosApi,
  rotuloContainerCadastro,
  type AeroportoCadastro,
  type ContainerCadastro,
  type PaisCadastro,
  type PortoCadastro,
} from './cadastrosApi'

export interface GTOpcaoCadastro {
  valor: string
  label: string
}

export interface UseCadastrosListaBidFreteResult {
  paisesOpcoes: GTOpcaoCadastro[]
  portosOpcoes: GTOpcaoCadastro[]
  aeroportosOpcoes: GTOpcaoCadastro[]
  containersOpcoes: GTOpcaoCadastro[]
  portos: PortoCadastro[]
  aeroportos: AeroportoCadastro[]
  loading: boolean
  erro: string | null
}

function formatarPais(pais: PaisCadastro): GTOpcaoCadastro {
  return {
    valor: pais.codigo_pais_iso_alpha2,
    label: `${pais.codigo_pais_iso_alpha2} — ${pais.nome_pais_portugues}`,
  }
}

function formatarPorto(porto: PortoCadastro): GTOpcaoCadastro {
  return {
    valor: porto.codigo_unlocode_porto,
    label: `${porto.codigo_unlocode_porto} — ${porto.nome_porto}`,
  }
}

function formatarAeroporto(aeroporto: AeroportoCadastro): GTOpcaoCadastro {
  const codigo = aeroporto.codigo_iata_aeroporto?.trim() || aeroporto.codigo_unlocode_aeroporto
  return {
    valor: codigo,
    label: `${codigo} — ${aeroporto.nome_aeroporto}`,
  }
}

function formatarContainer(container: ContainerCadastro): GTOpcaoCadastro {
  const codigo = container.codigo_iso_container?.trim()
  if (!codigo) return { valor: '', label: '' }
  return {
    valor: codigo,
    label: `${codigo} — ${rotuloContainerCadastro(container)}`,
  }
}

export function rotuloCadastroLista(
  valor: string | null | undefined,
  opcoes: GTOpcaoCadastro[],
): string {
  if (!valor) return ''
  return opcoes.find(o => o.valor === valor)?.label ?? valor
}

export function useCadastrosListaBidFrete(): UseCadastrosListaBidFreteResult {
  const [paises, setPaises] = useState<PaisCadastro[]>([])
  const [portos, setPortos] = useState<PortoCadastro[]>([])
  const [aeroportos, setAeroportos] = useState<AeroportoCadastro[]>([])
  const [containers, setContainers] = useState<ContainerCadastro[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      setLoading(true)
      setErro(null)
      try {
        const [paisesResp, portosResp, aeroportosResp, containersResp] = await Promise.all([
          cadastrosApi.listarPaises(),
          cadastrosApi.listarPortos({ limit: 500 }),
          cadastrosApi.listarAeroportos({ limit: 500 }),
          cadastrosApi.listarContainers({ limit: 500 }),
        ])
        if (cancelado) return
        setPaises(paisesResp.itens)
        setPortos(portosResp.itens)
        setAeroportos(aeroportosResp.itens)
        setContainers(containersResp.itens)
      } catch (err) {
        if (cancelado) return
        setErro(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelado) setLoading(false)
      }
    }

    void carregar()
    return () => { cancelado = true }
  }, [])

  return useMemo(() => ({
    paisesOpcoes: paises.map(formatarPais),
    portosOpcoes: portos.map(formatarPorto),
    aeroportosOpcoes: aeroportos.map(formatarAeroporto),
    containersOpcoes: containers
      .map(formatarContainer)
      .filter(c => c.valor.length > 0),
    portos,
    aeroportos,
    loading,
    erro,
  }), [paises, portos, aeroportos, containers, loading, erro])
}
