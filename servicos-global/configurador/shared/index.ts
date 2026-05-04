// shared/index.ts
//
// Barrel de exports compartilhados entre client (src/) e server (server/) do Configurador.
// Apenas funções/tipos puros — sem deps de Node, sem deps de React, sem Prisma.
// Padrão alinhado com `servicos-global/cadastros/shared/`.

export { temBypassPermissao, type TipoUsuarioBypass } from './permissao-bypass.js'
