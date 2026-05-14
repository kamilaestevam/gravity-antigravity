/**
 * colunasUsuarioSchemas.ts — Schemas Zod do endpoint de colunas customizadas
 *
 * Extraído de colunasUsuario.ts para permitir importação isolada em testes
 * sem arrastar as dependências de Express, Prisma e Gemini.
 */

import { z } from 'zod'

export const CriarColunaSchema = z.object({
  nome:             z.string().min(1, 'O nome da coluna é obrigatório.')
                              .max(50, 'O nome da coluna não pode ultrapassar 50 caracteres.'),
  tipo:             z.enum(['texto', 'numero', 'data', 'select', 'checkbox', 'percentual', 'tipo_documento', 'formula']),
  escopo:           z.enum(['pedido', 'item', 'ambos']).default('ambos'),
  visibilidade:     z.enum(['todos', 'roles', 'privado']).default('todos'),
  roles_permitidas: z.array(z.string()).optional(),
  obrigatorio:      z.boolean().default(false),
  opcoes:           z.array(z.string()).optional(),
  descricao:        z.string().max(200, 'A descrição não pode ultrapassar 200 caracteres.').optional(),
  valor_padrao:     z.string().max(1000, 'O valor padrão não pode ultrapassar 1000 caracteres.').optional(),
})

export const AtualizarColunaSchema = z.object({
  nome:             z.string().min(1, 'O nome da coluna é obrigatório.')
                              .max(50, 'O nome da coluna não pode ultrapassar 50 caracteres.').optional(),
  // tipo é propositalmente ausente — não pode ser alterado
  escopo:           z.enum(['pedido', 'item', 'ambos']).optional(),
  visibilidade:     z.enum(['todos', 'roles', 'privado']).optional(),
  roles_permitidas: z.array(z.string()).optional(),
  obrigatorio:      z.boolean().optional(),
  opcoes:           z.array(z.string()).optional(),
  descricao:        z.string().max(200, 'A descrição não pode ultrapassar 200 caracteres.').optional(),
  valor_padrao:     z.string().max(1000, 'O valor padrão não pode ultrapassar 1000 caracteres.').optional(),
})
// Nota: bloqueio de mudança de tipo é feito no route handler (if 'tipo' in req.body),
// não aqui — Zod stripa campos desconhecidos antes de qualquer .refine().

export const ReordenarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

export const SalvarValoresSchema = z.object({
  vinculo:    z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
  valores:    z.record(
    z.string().max(1000, 'O conteúdo de cada campo não pode ultrapassar 1000 caracteres.')
  ).refine(v => Object.keys(v).length <= 100, {
    message: 'Máximo de 100 campos por requisição.',
  }),
})

export const ListarValoresQuerySchema = z.object({
  vinculo:    z.enum(['pedido', 'item']),
  vinculo_id: z.string().min(1),
})

export const GabiAnaliseSchema = z.object({
  expressao: z.string().min(1).max(2000),
  campos: z.array(z.object({
    chave:    z.string(),
    label:    z.string(),
    unidade:  z.string().optional(),
    papel:    z.string().optional(),
    tipo:     z.string().optional(),
  })),
})
