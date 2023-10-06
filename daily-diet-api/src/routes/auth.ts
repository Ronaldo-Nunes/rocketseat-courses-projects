import { FastifyInstance, FastifyReply } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomBytes, randomUUID } from 'crypto'
import { encryptText } from '../utils/encrypt-text'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const registerSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { name, email, password } = registerSchema.parse(request.body)
    const existingEmail = await knex('users').where('email', email).first()

    if (existingEmail) {
      return reply.status(409).send({ error: 'E-mail already registered' })
    }

    const salt = randomBytes(32).toString('hex')
    const hashedPass = encryptText(password, salt)
    const userId = randomUUID()

    await knex('users').insert({
      id: userId,
      email,
      name,
      salt,
      hash: hashedPass,
    })

    setUserCookie(reply, userId)

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { email, password } = loginSchema.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (!user) {
      return reply.status(401).send()
    }

    const hashedPass = encryptText(password, user.salt)
    if (hashedPass !== user.hash) {
      return reply.status(401).send()
    }

    setUserCookie(reply, user.id)

    return reply.status(200).send()
  })

  app.post('/logout', async (request, reply) => {
    const { userId: loggedUserId } = request.cookies

    if (loggedUserId) {
      reply.clearCookie('userId')
      return reply.status(200).send()
    }

    return reply.status(400).send({ error: 'There is no user logged in' })
  })
}

function setUserCookie(reply: FastifyReply, cookieValue: string) {
  reply.cookie('userId', cookieValue, {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  })
}
