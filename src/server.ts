import { app } from './app'

// abre a conexao, trazendo o app do fastify, com a porta 3333
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Http Server Running!')
  })
