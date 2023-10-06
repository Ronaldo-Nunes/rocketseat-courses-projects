import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
export async function checkIfAuthenticaded(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const loggedUserId = request.cookies.userId

  if (!loggedUserId) {
    return reply.status(401).send({ error: 'Unautorized.' })
  }

  const userId = await knex('users')
    .where('id', loggedUserId)
    .select('id')
    .first()

  if (!userId) {
    return reply.status(401).send({ error: 'Unautorized.' })
  }
}
