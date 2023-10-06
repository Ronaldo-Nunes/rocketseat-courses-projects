import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal while being authenticated', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Jantar',
        description: 'Feijoada bem leve',
        datetime: '2023-10-05T22:42:46Z',
        isOnTheDiet: true,
      })
      .expect(201)
  })

  it('should not be able to create a new meal if you are not authenticated', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Jantar',
        description: 'Feijoada bem leve',
        datetime: '2023-10-05T22:42:46Z',
        isOnTheDiet: true,
      })
      .expect(401)
  })

  it('shoul be able to get a specific meal of the authenticated user', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-05T22:42:46Z',
      isOnTheDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = listMealsResponse.body.meals[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Jantar',
        description: 'Feijoada bem leve',
      }),
    )
  })

  it('shoul be able to list all meals of the authenticated user', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-05T22:42:46Z',
      isOnTheDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Jantar',
        description: 'Feijoada bem leve',
      }),
    ])
  })

  it('should be able to edit a meal while being authenticated', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-05T22:42:46Z',
      isOnTheDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Jantar editado',
        description: 'Feijoada bem leve editado',
        datetime: '2023-10-05T22:42:46Z',
        isOnTheDiet: true,
      })
      .expect(200)
  })

  it('should be able to delete a meal while being authenticated', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-05T22:42:46Z',
      isOnTheDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = listMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send()
      .expect(204)
  })

  it('should be able to get metrics while being authenticated', async () => {
    const registerResponse = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerResponse.get('Set-Cookie')

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-04T06:42:46Z',
      isOnTheDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-04T10:00:46Z',
      isOnTheDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-04T12:30:46Z',
      isOnTheDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-05T14:42:46Z',
      isOnTheDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Jantar',
      description: 'Feijoada bem leve',
      datetime: '2023-10-03T18:42:46Z',
      isOnTheDiet: true,
    })

    const getMetricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)

    expect(getMetricsResponse.body.metrics).toEqual(
      expect.objectContaining({
        totalMeals: 5,
        totalMealsWithinTheDiet: 3,
        totalOffDietMeals: 2,
        bestSequenceOfMealsWithinTheDiet: 2,
      }),
    )
  })
})
