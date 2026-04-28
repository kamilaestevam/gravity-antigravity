// Augmenta o objeto Request do Express com:
//   - tenant_id/user_id: resolvidos pelo checkAuth interno (ver routes/api.ts)
//   - auth: populado pelo requireAuth do proxy do configurador (Clerk JWT cruzado com DB)
//
// Substitui o uso de `(req as any)`. As tipagens são compatíveis com a declaração
// no configurador/server/middleware/requireAuth.ts (augmentation aditiva).

declare global {
  namespace Express {
    interface Request {
      tenant_id: string
      user_id: string
      auth?: {
        id_usuario: string
        id_organizacao: string
        clerkUserId: string
        tipo_usuario: string
      }
    }
  }
}

export {}
