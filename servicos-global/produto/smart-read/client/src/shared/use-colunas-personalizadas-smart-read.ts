/**
 * use-colunas-personalizadas-smart-read.ts — colunas criadas em Configurações › Colunas
 */

import { useEffect, useMemo, useState } from 'react'
import { useShellStore } from '@gravity/shell'
import type { ColunaPersonalizadaSmartRead } from '../components/ModalNovaColunaSmartRead'
import {
  filtrarColunasPersonalizadasVisiveis,
} from './filtro-visibilidade-colunas-personalizadas-smart-read'
import {
  SYNC_EVENT_CONFIGURACOES_SMART_READ,
  carregarConfiguracoesSmartRead,
} from './persistencia-configuracoes-smart-read'

function carregarColunasPersonalizadas(): ColunaPersonalizadaSmartRead[] {
  return carregarConfiguracoesSmartRead().colunas
}

export function useColunasPersonalizadasSmartRead() {
  const idUsuario = useShellStore((s) => s.currentUser.id ?? '')
  const tipoUsuario = useShellStore((s) => s.currentUser.tipoUsuario)
  const [colunas, setColunas] = useState(carregarColunasPersonalizadas)

  useEffect(() => {
    function sync() {
      setColunas(carregarColunasPersonalizadas())
    }
    window.addEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_CONFIGURACOES_SMART_READ, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const colunasVisiveisUsuario = useMemo(
    () => filtrarColunasPersonalizadasVisiveis(colunas, {
      id_usuario: idUsuario,
      tipo_usuario: tipoUsuario,
    }),
    [colunas, idUsuario, tipoUsuario],
  )

  const colunasAtivas = useMemo(
    () => colunasVisiveisUsuario.filter((col) => col.visible),
    [colunasVisiveisUsuario],
  )

  return { colunas, colunasVisiveisUsuario, colunasAtivas }
}
