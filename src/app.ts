import fastify from 'fastify'
import { dietsRoutes } from './routes/diets'
import cookie from '@fastify/cookie'

// inicializa o fastify para rodar a aplicação
export const app = fastify()

app.register(cookie)
app.register(dietsRoutes)
