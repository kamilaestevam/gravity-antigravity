import { Router } from 'express'
import { configRouter } from './routes/config.routes.js'
import { widgetRouter } from './routes/widget.routes.js'
import { catalogRouter } from './routes/catalog.routes.js'
import { sseRouter } from './routes/sse.routes.js'
import { alertRouter } from './routes/alert.routes.js'
import { shareRouter } from './routes/share.routes.js'

const router = Router()

router.use('/configs', configRouter)
router.use('/widgets', widgetRouter)
router.use('/catalog', catalogRouter)
router.use('/stream', sseRouter)
router.use('/alerts', alertRouter)
router.use('/share', shareRouter)

export { router as dashboardRouter }
