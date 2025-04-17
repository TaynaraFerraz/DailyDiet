import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function dietsRoutes(app: FastifyInstance) {
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

  app.post('/meals', async (request, reply) => {
    const createMealsSchema = z.object({
      name: z.string(),
      description: z.string(),
      isInTheDiet: z.boolean(),
    })

    const validationResult = createMealsSchema.safeParse(request.body)

    if (!validationResult.success) {
      reply.status(400).send({
        error: 'Incorrect syntax',
      })
    } else {
      const { name, description, isInTheDiet } = validationResult.data
      const tokenId = request.cookies.tokenId

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        isInTheDiet,
        created_at: new Date().toISOString(),
        user_id: tokenId,
      })
    }
  })

  app.get('/meals', async () => {
    const meals = await knex('meals').select()
    // fazer apenas o usuario ver suas refeições
    return { meals }
  })
}
