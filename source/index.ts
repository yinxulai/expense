import Fastify from 'fastify'

import fastifyCookie from '@fastify/cookie'
import { PrismaClient } from '@prisma/client'

import { config } from '@helpers/config'
import { createReplyHandler } from '@plugins/reply'
import { createHealthRouter } from '@modules/health'
import { createUserRouter, createUserService } from '@modules/user'
import { createSecretService, createSecretRouter } from '@modules/secret'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

console.log(`version: ${config.version}`)

const fastify = Fastify({ logger: config.debugLog })
const db = new PrismaClient({ datasourceUrl: config.datasourceUrl })

fastify.setValidatorCompiler(validatorCompiler)
fastify.setSerializerCompiler(serializerCompiler)

fastify.register(createReplyHandler())
fastify.register(fastifyCookie, { hook: 'onRequest' })

const userService = createUserService(db)
const secretService = createSecretService(db)

fastify.register(createUserRouter({ userService, secretService }))
fastify.register(createSecretRouter({ userService, secretService }))
fastify.register(createHealthRouter({ services: [userService, secretService] }))

fastify.listen({ port: config.apiPort, host: '0.0.0.0' })
  .then(() => console.log(`api server started on port ${config.apiPort}`))
  .catch(error => console.error('api server listen error', error))
