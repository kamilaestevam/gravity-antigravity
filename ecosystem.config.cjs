// ecosystem.config.cjs — PM2 local dev orchestration for Gravity
//
// Substitui o `npm run dev` (concurrently -k) por 14 processos independentes:
//   - cada serviço reinicia sozinho sem derrubar os outros
//   - PORT explícito em cada entry evita conflito de herança de variável
//   - backoff exponencial evita loops de crash em falha de banco
//
// Uso (via scripts do package.json):
//   npm run pm2:start         — inicia todos os 14 serviços
//   npm run pm2:start:safe    — aguarda cfg-back /health antes de subir cfg-front
//   npm run pm2:stop          — para todos
//   npm run pm2:restart       — reinicia todos
//   npm run pm2:status        — lista status + restarts
//   npm run pm2:logs          — tail de todos os logs
//   npm run pm2:delete        — remove todos do daemon (dev:reset usa isso)

'use strict'

const path = require('path')
const ROOT = path.resolve(__dirname)

// Windows: PM2 não consegue executar npm.cmd diretamente via Node — usa cmd.exe
// Linux/Mac: usa sh -c
const isWin = process.platform === 'win32'
const shellExe = isWin ? 'cmd' : 'sh'
const shellRun = (cmd) => isWin ? `/c ${cmd}` : `-c "${cmd}"`

function svc(name, relCwd, port, overrides = {}) {
  return {
    name,
    script: shellExe,
    args: shellRun('npm run dev'),
    cwd: path.join(ROOT, relCwd),
    autorestart: true,
    max_restarts: 10,
    restart_delay: 2000,
    exp_backoff_restart_delay: 100,
    kill_timeout: 5000,
    watch: false,
    env: { PORT: String(port), NODE_ENV: 'development' },
    ...overrides,
  }
}

module.exports = {
  apps: [

    // ── Configurador ─────────────────────────────────────────────────────────
    svc('cfg-back',  'servicos-global/configurador', 8005),

    {
      // Frontend Vite — npm run dev:client
      name: 'cfg-front',
      script: shellExe,
      args: shellRun('npm run dev:client'),
      cwd: path.join(ROOT, 'servicos-global/configurador'),
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 5000,
      watch: false,
      env: { PORT: '8000', NODE_ENV: 'development' },
    },

    // ── Plataforma super-server ───────────────────────────────────────────────
    svc('org',         'servicos-global/servicos-plataforma',                3001),

    // ── Serviços de plataforma independentes ─────────────────────────────────
    svc('cockpit',     'servicos-global/servicos-plataforma/api-cockpit',   8016),
    svc('conector-erp','servicos-global/servicos-plataforma/conector-erp',  8017),

    // ── Produtos ─────────────────────────────────────────────────────────────
    svc('sc-back',     'servicos-global/produto/simula-custo',              8020),
    svc('bid-frete',   'servicos-global/produto/bid-frete',                 8023),
    svc('bid-cambio',  'servicos-global/produto/bid-cambio',                8025),
    svc('proc-back',   'servicos-global/produto/processo',                  8026),
    svc('lpco',        'servicos-global/produto/lpco',                      8027),
    svc('nf-importacao','servicos-global/produto/nf-importacao',            8028),
    svc('fin-comex',   'servicos-global/produto/financeiro-comex',          8029),
    svc('pedido',      'servicos-global/produto/pedido',                    8030),

    // ── Cadastros ─────────────────────────────────────────────────────────────
    svc('cadastros',   'servicos-global/cadastros',                         8031),

  ],
}
