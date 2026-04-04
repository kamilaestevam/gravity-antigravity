/**
 * AppError.ts — Classe de erro padronizada do servidor Pedido
 *
 * Usada em todas as rotas e middlewares para lançar erros estruturados.
 * O error handler global em index.ts processa instâncias desta classe.
 *
 * Skill: antigravity-code-standards (Tratamento de Erros)
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'BAD_REQUEST',
  ) {
    super(message)
    this.name = 'AppError'
  }
}
