import { Router } from 'express'
import { blingWebhookController } from '../controllers/bling-webhook-controller'

const blingRouter = Router()

blingRouter.post('/bling/webhook', blingWebhookController)

export { blingRouter }