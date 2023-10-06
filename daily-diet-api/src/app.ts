import { fastify } from 'fastify'
import cookie from '@fastify/cookie'
import { authRoutes } from './routes/auth'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)

app.register(authRoutes)

app.register(mealsRoutes, {
  prefix: 'meals'
})