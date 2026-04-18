/**
 * Erros tipados do SDK.
 *
 * Toda falha do tenant-resolver vira `AppError` — nunca `res.status().json()`
 * direto. O handler global de erro do produto traduz para resposta HTTP.
 */

/**
 * Erro de domínio do SDK (e do projeto Gravity como um todo).
 *
 * @param message    Mensagem técnica para log (não exibir cru ao usuário final).
 * @param statusCode Código HTTP a ser usado pelo handler global.
 * @param code       Código simbólico estável para clientes/i18n.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;

    // Preserva stack trace correta em V8.
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AppError);
    }

    // Garante que `instanceof AppError` funcione mesmo cruzando bundles.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
