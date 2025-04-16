import fastify from 'fastify'
import { dietsRoutes } from './routes/diets'

// inicializa o fastify para rodar a aplicação
export const app = fastify()

app.register(dietsRoutes, {
  prefix: 'diets',
})
