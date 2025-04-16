// configuração com knex e conexão com o banco de dados

import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
  client: 'sqlite',
  connection: './db/app.db',
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
