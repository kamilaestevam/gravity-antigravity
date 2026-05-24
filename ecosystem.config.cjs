// ecosystem.config.cjs — PM2 local dev orchestration for Gravity
//
// 14 processos independentes via PM2 (substitui concurrently -k):
//   - cada serviço reinicia sozinho sem derrubar os outros
//   - PORT explícito em cada entry evita conflito de herança de variável
//   - backoff exponencial evita loops de crash em falha de banco
//
// Windows: backends usam scripts/pm2-dev-launcher.cjs — re-spawna tsx watch
// com windowsHide: true para evitar dezenas de janelas de terminal visíveis.
//
// Uso:
//   npx pm2 start ecosystem.config.cjs   — inicia todos os 14 serviços
//   npx pm2 stop ecosystem.config.cjs     — para todos
//   npx pm2 restart ecosystem.config.cjs  — reinicia todos
//   npx pm2 status                        — lista status + restarts
//   npx pm2 logs                          — tail de todos os logs
//   npm run dev:reset                     — reset total (PM2 + portas + cache Vite)

'use strict'

const path = require('path')
const ROOT = path.resolve(__dirname)

const LAUNCHER = path.join(ROOT, 'scripts/pm2-dev-launcher.cjs')
const VITE = path.join(ROOT, 'node_modules/vite/bin/vite.js')

const PM2_DEFAULTS = {
  autorestart: true,
  max_restarts: 10,
  restart_delay: 2000,
  exp_backoff_restart_delay: 100,
  kill_timeout: 5000,
  watch: false,
  windowsHide: true,
}

function svc(name, relCwd, port, envFiles, entry) {
  return {
    name,
    script: LAUNCHER,
    cwd: path.join(ROOT, relCwd),
    ...PM2_DEFAULTS,
    env: {
      PORT: String(port),
      NODE_ENV: 'development',
      PM2_DEV_ENTRY: entry,
      PM2_DEV_ENV_FILES: envFiles.join('|'),
    },
  }
}

// Profundidade do --env-file relativo ao cwd (ver monorepo SKILL §1.bis)
const ENV_SERVICO = ['../../.env.local', '.env']       // servicos-global/<x>/
const ENV_PLATAFORMA = ['../../../.env.local', '.env'] // servicos-plataforma/<x>/ ou produto/<x>/

module.exports = {
  apps: [

    // ── Configurador ─────────────────────────────────────────────────────────
    svc('cfg-back', 'servicos-global/configurador', 8005, ENV_SERVICO, 'server/index.ts'),

    {
      // Vite direto — PM2 controla o processo real (sem cmd→npm→vite no Windows)
      name: 'cfg-front',
      script: VITE,
      cwd: path.join(ROOT, 'servicos-global/configurador'),
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 8000,
      watch: false,
      windowsHide: true,
      env: { PORT: '8000', NODE_ENV: 'development' },
    },

    // ── Plataforma super-server ───────────────────────────────────────────────
    svc('org', 'servicos-global/servicos-plataforma', 3001, ENV_SERVICO, 'server/index.ts'),

    // ── Serviços de plataforma independentes ─────────────────────────────────
    svc('cockpit', 'servicos-global/servicos-plataforma/api-cockpit', 8016, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('conector-erp', 'servicos-global/servicos-plataforma/conector-erp', 8017, ENV_PLATAFORMA, 'server/index.ts'),

    // ── Produtos ─────────────────────────────────────────────────────────────
    svc('sc-back', 'servicos-global/produto/simula-custo', 8020, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('bid-frete', 'servicos-global/produto/bid-frete', 8023, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('bid-cambio', 'servicos-global/produto/bid-cambio', 8025, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('proc-back', 'servicos-global/produto/processo', 8026, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('lpco', 'servicos-global/produto/lpco', 8027, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('nf-importacao', 'servicos-global/produto/nf-importacao', 8028, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('fin-comex', 'servicos-global/produto/financeiro-comex', 8029, ENV_PLATAFORMA, 'server/src/index.ts'),
    svc('pedido', 'servicos-global/produto/pedido', 8030, ENV_PLATAFORMA, 'server/src/index.ts'),

    // ── Cadastros ─────────────────────────────────────────────────────────────
    svc('cadastros', 'servicos-global/cadastros', 8031, ENV_SERVICO, 'server/src/index.ts'),

  ],
}
