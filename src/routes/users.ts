import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.post('/users', async (request, reply) => {
    // se nao tivesse uma tipagem anteriormente, o name e title estaria dando erro de tipagem

    const createUsersBodySchema = z.object({
      name: z.string().nonempty(),
      email: z.string().nonempty(),
    })

    const validationResult = createUsersBodySchema.safeParse(request.body)

    if (!validationResult.success) {
      reply.status(400).send({
        error: 'Incorrect syntax',
      })
    } else {
      const { name, email } = validationResult.data

      const existEmail = await knex('users').where('email', email).first()

      if (existEmail) {
        reply.status(400).send({
          error: 'Email already registered',
        })
      }

      const tokenId = randomUUID()

      reply.cookie('tokenId', tokenId, {
        path: '/', // qualquer rota pode acessar os cookies
        maxAge: 60 * 60 * 24 * 7, // 7 dias
        sameSite: 'lax',
      })

      await knex('users').insert({
        id: tokenId,
        name,
        email,
      })

      reply.status(201).send()
    }
  })

  app.get('/users', async () => {
    const users = await knex('users').select()

    return { users }
  })
}
