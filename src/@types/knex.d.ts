// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    user: {
      id: string
      name: string
    }
    meals: {
      id: string
      name: string
      description: string
      created_at: string
      isInTheDiet: boolean
      user_id: string
    }
  }
}
