/**
 * useLogisticaCadastrosPedido.ts — Catálogos logísticos do Cadastros para a lista de Pedidos.
 *
 * SSOT:
 *   - local_de_*  → cadastros.pais (codigo_pais_iso_alpha2)
 *   - porto_*     → cadastros.porto (codigo_unlocode_porto)
 *   - aeroporto_* → cadastros.aeroporto (codigo_iata_aeroporto ou codigo_unlocode_aeroporto)
 */
import { useEffect, useMemo, useState } from 'react'
import { cadastrosApi, type AeroportoCadastro, type Pais, type PortoCadastro } from './cadastrosApi'

export interface GTOpcaoCadastro {
  valor: string
  label: string
}

export interface UseLogisticaCadastrosPedidoResult {
  paisesOpcoes: GTOpcaoCadastro[]
  portosOpcoes: GTOpcaoCadastro[]
  aeroportosOpcoes: GTOpcaoCadastro[]
  loading: boolean
  erro: string | null
}

function formatarPais(pais: Pais): GTOpcaoCadastro {
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

export function renderRotuloCadastro(
  valor: string | null | undefined,
  opcoes: GTOpcaoCadastro[],
  fallback: string,
): string {
  if (!valor) return ''
  const opcao = opcoes.find((o) => o.valor === valor)
  return opcao?.label ?? valor ?? fallback
}

export function useLogisticaCadastrosPedido(): UseLogisticaCadastrosPedidoResult {
  const [paises, setPaises] = useState<Pais[]>([])
  const [portos, setPortos] = useState<PortoCadastro[]>([])
  const [aeroportos, setAeroportos] = useState<AeroportoCadastro[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      setLoading(true)
      setErro(null)
      try {
        const [paisesResp, portosResp, aeroportosResp] = await Promise.all([
          cadastrosApi.listarPaises(),
          cadastrosApi.listarPortos({ limit: 500 }),
          cadastrosApi.listarAeroportos({ limit: 500 }),
        ])
        if (cancelado) return
        setPaises(paisesResp.itens)
        setPortos(portosResp.itens)
        setAeroportos(aeroportosResp.itens)
      } catch (err) {
        if (cancelado) return
        const msg = err instanceof Error ? err.message : String(err)
        setErro(msg)
        // eslint-disable-next-line no-console
        console.warn('[useLogisticaCadastrosPedido] falha ao carregar catálogos:', msg)
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
    loading,
    erro,
  }), [paises, portos, aeroportos, loading, erro])
}
