import setupKnex, { Knex } from 'knex'
import { env } from './env'

const connectionToDB =
  env.DATABASE_CLIENT === 'sqlite'
    ? { filename: env.DATABASE_URL }
    : env.DATABASE_URL

export const knexConfig: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: connectionToDB,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(knexConfig)
