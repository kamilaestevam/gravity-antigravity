/** Contratos mínimos da lista Pedido reutilizados na lista Processo (camada 2). */
export interface RegrasConfigBackend {
  duplicar_numero_auto: boolean
  duplicar_copiar_datas: boolean
  duplicar_status_inicial: string
  excluir_status_permitidos: string[]
  excluir_pedido_sem_item_permitido: boolean
  excluir_confirmar_com_preview: boolean
  alerta_numero_duplicado: boolean
  alerta_valor_total_divergente: boolean
  alerta_quantidade_total_divergente: boolean
  alerta_quantidade_pronta_divergente: boolean
  alerta_peso_liquido_divergente: boolean
  alerta_peso_bruto_divergente: boolean
  alerta_cubagem_divergente: boolean
}
