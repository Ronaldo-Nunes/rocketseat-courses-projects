import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkIfAuthenticaded } from '../middlewares/check-if-authenticaded'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkIfAuthenticaded)

  app.post('/', async (request, reply) => {
    const createMealsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.string().transform((str) => new Date(str)),
      isOnTheDiet: z.boolean(),
    })

    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const { name, description, datetime, isOnTheDiet } =
      createMealsBodySchema.parse(request.body)

    const { userId } = cookieSchema.parse(request.cookies)
    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      datetime,
      is_on_the_diet: isOnTheDiet,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const updateMealsBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      datetime: z
        .string()
        .transform((str) => new Date(str))
        .optional(),
      isOnTheDiet: z.boolean().optional(),
    })

    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const updateMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { userId } = cookieSchema.parse(request.cookies)
    const { id } = updateMealsParamsSchema.parse(request.params)

    const { name, description, datetime, isOnTheDiet } =
      updateMealsBodySchema.parse(request.body)

    if (!name && !description && !datetime && !isOnTheDiet) {
      return reply.status(400).send({ error: 'No data was reported' })
    }

    const oldMeal = await knex('meals').where({ id, user_id: userId }).first()

    if (!oldMeal) {
      return reply.status(404).send()
    }

    const updateMeal = {
      name: name ?? oldMeal.name,
      description: description ?? oldMeal.description,
      datetime: datetime ?? oldMeal.datetime,
      is_on_the_diet: isOnTheDiet ?? oldMeal.is_on_the_diet,
      user_id: oldMeal.user_id,
    }

    await knex('meals').update(updateMeal).where('id', id)

    return reply.status(200).send()
  })

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const { userId } = cookieSchema.parse(request.cookies)

    await knex('meals').delete().where({ id, user_id: userId })

    return reply.status(204).send()
  })

  app.get('/', async (request) => {
    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = cookieSchema.parse(request.cookies)

    const meals = await knex('meals')
      .where('user_id', userId)
      .select()
      .orderBy('datetime', 'last')

    return { meals }
  })

  app.get('/:id', async (request) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const { userId } = cookieSchema.parse(request.cookies)

    const meal = await knex('meals')
      .where({ id, user_id: userId })
      .select()
      .first()

    return { meal }
  })

  app.get('/metrics', async (request) => {
    const cookieSchema = z.object({
      userId: z.string().uuid(),
    })

    const { userId } = cookieSchema.parse(request.cookies)

    const meals = await knex('meals')
      .where('user_id', userId)
      .orderBy('datetime', 'last')

    const totalMeals = meals.length

    const totalMealsWithinTheDiet = meals.filter(
      (meal) => Boolean(meal.is_on_the_diet) === true,
    ).length

    const totalOffDietMeals = totalMeals - totalMealsWithinTheDiet

    const mealsOnTheDiet = []
    let counter = 0
    for (const meal of meals) {
      if (meal.is_on_the_diet) {
        counter++
      } else {
        mealsOnTheDiet.push(counter)
        counter = 0
      }
    }
    if (counter > 0) {
      mealsOnTheDiet.push(counter)
    }

    const bestSequenceOfMealsWithinTheDiet = Math.max(...mealsOnTheDiet)

    const metrics = {
      totalMeals,
      totalMealsWithinTheDiet,
      totalOffDietMeals,
      bestSequenceOfMealsWithinTheDiet,
    }

    return { metrics }
  })
}
