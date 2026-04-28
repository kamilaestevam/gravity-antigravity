import { Router } from 'express'
import { configRouter } from './routes/config.routes.js'
import { widgetRouter } from './routes/widget.routes.js'
import { catalogRouter } from './routes/catalog.routes.js'
import { sseRouter } from './routes/sse.routes.js'
import { alertRouter } from './routes/alert.routes.js'
import { shareRouter } from './routes/share.routes.js'

const router = Router()

router.use('/configs', configRouter)
router.use('/', widgetRouter)
router.use('/catalogo', catalogRouter)
router.use('/', sseRouter)
router.use('/', alertRouter)
router.use('/', shareRouter)

export { router as dashboardRouter }

// ── Super-servidor: router com prefixo absoluto ───────────────────────────────
const serviceRouter = Router()
serviceRouter.use('/api/v1/dashboards', router)
export { serviceRouter as dashboardServiceRouter }
