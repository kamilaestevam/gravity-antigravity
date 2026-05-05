import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

export const documentacaoApiRouter = Router()
const registry = new OpenAPIRegistry()

// Minimal example registering a schema and route.
// In a full implementation, you'd register all Zod schemas from tokens, webhooks, erp here.

registry.registerPath({
  method: 'get',
  path: '/api/v1/api-tokens',
  summary: 'List API Tokens',
  description: 'Retrieve all API tokens for the current tenant.',
  responses: {
    200: {
      description: 'List of tokens'
    }
  }
})

// Generate Document
const generator = new OpenApiGeneratorV3(registry.definitions)
const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Gravity API Cockpit',
    version: '1.0.0',
    description: 'API integration endpoints for tenants (Webhooks, Tokens, ERP).'
  },
  servers: [{ url: '/' }]
})

// Expose Swagger UI
documentacaoApiRouter.use('/', swaggerUi.serve, swaggerUi.setup(openApiDocument))

// Expose Raw JSON
documentacaoApiRouter.get('/openapi-json', (req, res) => {
  res.json(openApiDocument)
})
