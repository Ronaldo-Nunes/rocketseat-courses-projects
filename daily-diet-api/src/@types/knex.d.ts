// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      hash: string
      salt: string
    }

    meals: {
      id: string
      name: string
      description: string
      datetime: Date
      is_on_the_diet: boolean
      user_id: string
    }
  }
}
