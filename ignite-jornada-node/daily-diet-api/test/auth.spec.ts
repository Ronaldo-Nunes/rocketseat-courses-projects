import { execSync } from 'node:child_process'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { knex } from '../src/database'

describe('Auth routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/register')
      .send({
        name: 'Fulano',
        email: 'exampletest@email.com',
        password: '123456',
      })
      .expect(201)
  })

  it('should be able to authenticate after registering', async () => {
    const registrationRequest = await request(app.server)
      .post('/register')
      .send({
        name: 'Fulano',
        email: 'exampletest@email.com',
        password: '123456',
      })

    const user = await knex('users')
      .where('email', 'exampletest@email.com')
      .select('id')
      .first()

    const cookies = registrationRequest.get('Set-Cookie')

    const userCookie = cookies.find((part) => part.trim().startsWith('userId='))
    const regex = /userId=([^;]+)/
    const matches = userCookie?.match(regex)
    const userIdCookie = matches?.[1]

    const equalValues =
      typeof userIdCookie === 'string' && userIdCookie === user?.id

    expect(equalValues).toBeTruthy()
  })

  it('should generate failure if the same email already exists', async () => {
    await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    await request(app.server)
      .post('/register')
      .send({
        name: 'Fulano repetido',
        email: 'exampletest@email.com',
        password: '123458',
      })
      .expect(409)
  })

  it('should be able to exit to the application', async () => {
    const registerRequest = await request(app.server)
      .post('/register')
      .send({
        name: 'Fulano',
        email: 'exampletest@email.com',
        password: '123456',
      })
      .expect(201)

    const cookies = registerRequest.get('Set-Cookie')

    await request(app.server)
      .post('/logout')
      .set('Cookie', cookies)
      .send()
      .expect(200)
  })

  it('should be able to log in to the application', async () => {
    const registerRequest = await request(app.server).post('/register').send({
      name: 'Fulano',
      email: 'exampletest@email.com',
      password: '123456',
    })

    const cookies = registerRequest.get('Set-Cookie')

    await request(app.server).post('/logout').set('Cookie', cookies).send()

    await request(app.server).post('/login').send({
      email: 'exampletest@email.com',
      password: '123456',
    })
  })
})
