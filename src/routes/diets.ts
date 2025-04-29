import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function dietsRoutes(app: FastifyInstance) {
  // Cria uma refeição de um usuário
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

  // Retorna as refeições de um usuário
  app.get('/meals', async (request) => {
    const id = request.cookies.tokenId
    const meals = await knex('meals').select().where('user_id', id)
    return { meals }
  })

  // Retorna uma refeição individual de um usuário
  app.get('/meals/:id', async (request, reply) => {
    const UniqueMealSchema = z.object({
      id: z.string(),
    })

    const validationResult = UniqueMealSchema.safeParse(request.params)
    const id = validationResult.data?.id
    const isRealId = await knex('meals').where('id', id).first()

    const idUser = request.cookies.tokenId
    const isUser = await knex('meals')
      .where('user_id', idUser)
      .andWhere('id', id)
      .first()

    if (validationResult && isRealId && isUser) {
      const meal = await knex('meals').select().where('id', id)
      reply.status(200).send({
        meal,
      })
    } else if (!isRealId) {
      reply.status(404).send({
        error: 'Meal unique identification not found',
      })
    } else {
      reply.status(404).send({
        error: 'User not related to the meal',
      })
    }
  })

  // Deleta uma refeição de um usuário
  app.delete('/meals/:id', async (request, reply) => {
    const deleteMealsSchema = z.object({
      id: z.string(),
    })

    const validationResult = deleteMealsSchema.safeParse(request.params)
    const id = validationResult.data?.id
    const isRealId = await knex('meals').where('id', id).first()

    const idUser = request.cookies.tokenId
    const isUser = await knex('meals')
      .where('user_id', idUser)
      .andWhere('id', id)
      .first()

    if (validationResult && isRealId && isUser) {
      await knex('meals').where('id', id).del()

      reply.status(200)
    } else if (!isRealId) {
      reply.status(404).send({
        error: 'Meal identification not found',
      })
    } else {
      reply.status(404).send({
        error: 'User not related to the meal',
      })
    }
  })

  // Edita a refeição de um usuário
  app.put('/meals/:id', async (request, reply) => {
    const updateMealSchema = z.object({
      name: z.string().nonempty('Nome não pode ser vazio').optional(),
      description: z.string().nonempty('Nome não pode ser vazio').optional(),
      isInTheDiet: z.boolean().optional(),
    })

    const idType = z.object({
      id: z.string(),
    })

    const validationId = idType.safeParse(request.params)
    const id = validationId.data?.id
    const isRealId = await knex('meals').where('id', id).first()

    const validationResult = updateMealSchema.safeParse(request.body)

    const idUser = request.cookies.tokenId
    const isUser = await knex('meals')
      .where('user_id', idUser)
      .andWhere('id', id)
      .first()

    if (validationResult.data && isRealId && isUser) {
      // eslint-disable-next-line camelcase
      const { name, description, isInTheDiet } = validationResult.data

      if (
        name === undefined &&
        description === undefined &&
        isInTheDiet === undefined
      ) {
        reply.status(404).send({
          error: 'Request is empyt',
        })
      }

      await knex('meals').where('id', id).update({
        name,
        description,
        // eslint-disable-next-line camelcase
        isInTheDiet,
      })

      const updatedMeal = await knex('meals').where('id', id).first()

      reply.status(200).send({
        meal: updatedMeal,
      })
    } else if (!isRealId) {
      reply.status(404).send({
        error: 'Meal identification not found',
      })
    } else {
      reply.status(404).send({
        error: 'User not related to the meal',
      })
    }
  })

  app.get('/meals/metrics', async (request, reply) => {
    const idUserSchema = z.object({
      id: z.string(),
    })

    const userId = request.cookies.tokenId
    const validationId = idUserSchema.safeParse(userId)

    if (validationId) {
      const [numberMeals] = await knex('meals')
        .where('user_id', userId)
        .count('*', { as: 'count' })

      const [numberMealsInDiet] = await knex('meals')
        .where('user_id', userId)
        .andWhere('isInTheDiet', true)
        .count('*', { as: 'count' })

      const [numberMealsOutDiet] = await knex('meals')
        .where('user_id', userId)
        .andWhere('isInTheDiet', false)
        .count('*', { as: 'count' })

      const meals = await knex('meals').where('user_id', userId).select()

      let bestSequence = 0
      let maxSequence = 0
      for (const meal of meals) {
        if (Number(meal.isInTheDiet) === 1) bestSequence++
        else if (bestSequence > maxSequence) maxSequence = bestSequence
        else bestSequence = 0
      }

      reply.status(200).send({
        totalMeals: numberMeals.count,
        mealsInDiet: numberMealsInDiet.count,
        mealsOutDiet: numberMealsOutDiet.count,
        bestSequence,
      })
    }
  })
}
