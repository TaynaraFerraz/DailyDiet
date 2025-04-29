import fastify from 'fastify'
import { dietsRoutes } from './routes/diets'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users'

// inicializa o fastify para rodar a aplicação
export const app = fastify()

app.register(cookie)
app.register(userRoutes)
app.register(dietsRoutes)
