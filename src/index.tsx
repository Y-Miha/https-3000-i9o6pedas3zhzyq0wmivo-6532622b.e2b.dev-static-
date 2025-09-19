import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public/static directory
app.use('/static/*', serveStatic({ root: './public' }))

// Default route - serve our CRM system
app.get('/', (c) => {
  return c.redirect('/static/index.html')
})

// API routes for future backend functionality
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CRM API is running' })
})

export default app
