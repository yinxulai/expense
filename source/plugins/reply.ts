import { Prisma } from '@prisma/client'
import fastifyPlugin from 'fastify-plugin'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'

import { ErrorResponse } from '@helpers/error'
import { createResponse } from '@helpers/response'

export function createReplyHandler(): FastifyPluginAsync {
  return fastifyPlugin(async function plugin(app: FastifyInstance) {
    app.setErrorHandler((error, _request, reply) => {
      console.error(error)

      if (ErrorResponse.isAppError(error)) {
        console.error(error.parent || error)
        const appError: ErrorResponse = error
        reply.code(200).send(createResponse(appError.type, undefined, appError.message))
        return
      }

      // 处理数据库错误
      if (error instanceof Prisma.PrismaClientRustPanicError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
        return
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
        return
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
        return
      }

      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
        return
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
        return
      }

      // 输入校验错误
      if (error.validation && error.validation.length > 0) {
        // TODO：验证的详细错误信息通过 message 返回
        reply.code(200).send(createResponse('INVALID_INPUT', {}))
        return
      }

      // 未知错误
      reply.code(200).send(createResponse('UNKNOWN_ERROR', {}))
      return
    })
  })
}
