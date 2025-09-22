import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public/static directory (NO CACHE for development)
app.use('/static/*', serveStatic({ 
  root: './public',
  onNotFound: (path, c) => {
    console.log('Static file not found:', path)
  }
}))

// Default route - redirect to static CRM
app.get('/', (c) => {
  return c.redirect('/static/')
})

app.get('/crm', (c) => {
  return c.redirect('/static/')
})

// API routes for future backend functionality
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', message: 'CRM API is running' })
})

export default app
