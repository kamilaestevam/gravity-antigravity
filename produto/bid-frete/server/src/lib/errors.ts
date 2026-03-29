/**
 * errors.ts — AppError padrao Gravity
 * Skill: antigravity-criar-produto
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'BAD_REQUEST'
  ) {
    super(message)
    this.name = 'AppError'
  }
}
