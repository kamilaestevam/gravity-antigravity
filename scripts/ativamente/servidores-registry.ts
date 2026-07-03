/**
 * Registro canônico dos servidores de dev local (PM2).
 * Mantido em sincronia com ecosystem.config.cjs.
 *
 * Uso: scripts/ativamente/servidores-up.ts
 */

export type GrupoServidor = 'infra' | 'plataforma' | 'produto' | 'cadastros'

export interface ServidorDev {
  /** Nome do processo no PM2 (ecosystem.config.cjs → apps[].name) */
  pm2Name: string
  /** Rótulo legível */
  label: string
  port: number
  grupo: GrupoServidor
  /** Caminho do health check HTTP. Padrão: /health */
  healthPath?: string
}

/** Super-servidor :3001 — módulos agregados (não são processos PM2 separados). */
export const MODULOS_SERVIDOR_PLATAFORMA = [
  'atividades',
  'cronometro',
  'email',
  'gabi',
  'dashboard',
  'relatorios',
  'historico',
  'notificacoes',
  'agendamento',
  'preferencias-usuario',
  'whatsapp',
] as const

/**
 * Processos PM2 gerenciados por `npm run servidores`.
 * Ordem = ecosystem.config.cjs.
 */
export const SERVIDORES_PM2: readonly ServidorDev[] = [
  { pm2Name: 'cfg-back', label: 'Configurador (API)', port: 8005, grupo: 'infra' },
  { pm2Name: 'cfg-front', label: 'Shell / Configurador (UI)', port: 8000, grupo: 'infra', healthPath: '/' },
  { pm2Name: 'org', label: 'Super-servidor plataforma', port: 3001, grupo: 'plataforma' },
  { pm2Name: 'email', label: 'E-mail tenant (Resend S2S)', port: 8008, grupo: 'plataforma' },
  { pm2Name: 'cockpit', label: 'API Cockpit', port: 8016, grupo: 'plataforma' },
  { pm2Name: 'conector-erp', label: 'Conector ERP', port: 8017, grupo: 'plataforma' },
  { pm2Name: 'taxas-moeda', label: 'Taxas Moeda (BCB / PTAX)', port: 8032, grupo: 'plataforma' },
  { pm2Name: 'sc-back', label: 'Simula Custo', port: 8020, grupo: 'produto' },
  { pm2Name: 'bid-frete', label: 'BID Frete Internacional', port: 8023, grupo: 'produto' },
  { pm2Name: 'bid-cambio', label: 'BID Câmbio', port: 8025, grupo: 'produto' },
  { pm2Name: 'proc-back', label: 'Processo', port: 8026, grupo: 'produto' },
  { pm2Name: 'lpco', label: 'LPCO', port: 8027, grupo: 'produto' },
  { pm2Name: 'nf-importacao', label: 'NF Importação', port: 8028, grupo: 'produto' },
  { pm2Name: 'fin-comex', label: 'Financeiro COMEX', port: 8029, grupo: 'produto' },
  { pm2Name: 'pedido', label: 'Pedido', port: 8030, grupo: 'produto' },
  { pm2Name: 'cadastros', label: 'Cadastros', port: 8031, grupo: 'cadastros' },
] as const

export const PORTAS_SERVIDORES_PM2 = SERVIDORES_PM2.map((s) => s.port)
