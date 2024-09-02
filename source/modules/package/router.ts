import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { createAuth } from '@plugins/auth'
import { UserService } from '@modules/user'
import { SecretService } from '@modules/secret'

import { signToken } from '@helpers/token'
import { ErrorResponse } from '@helpers/error'
import { createSuccessResponse } from '@helpers/response'

import * as s from './schema'


interface RouterOptions {
  userService: UserService
  secretService: SecretService
}

export const createUserRouter = (options: RouterOptions): FastifyPluginAsync => {
  const { userService, secretService } = options

  return async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()

    typedApp.post('/sign-up', { schema: s.SignUpSchema }, async (request, reply) => {
      const user = await userService.getUserByUsername(request.body.username)
      if (user != null) throw new ErrorResponse('USER_ALREADY_EXISTS')
      const createdUser = await userService.createUser(request.body)
      const secret = await secretService.createSecret(createdUser.id, { type: 'SignIn' })

      // SignIn 类型的 Secret 一定会有过期时间，所以这里 !
      const expiredTime = secret.deletedTime!.toISOString()
      const createdTime = secret.createdTime.toISOString()

      const token = signToken(secret.value, {
        createdTime, expiredTime, data: {
          secretId: secret.key,
          userId: createdUser.id,
          username: createdUser.username,
        }
      })

      // 对于浏览器，可以通过 token 设置自动登录
      reply.setCookie('token', token, {
        httpOnly: true,
        expires: secret.deletedTime!,
      })

      // 对于 API 调用，通过 token 设置 header 添加验证
      return createSuccessResponse({
        token,
        expiredTime,
        userId: createdUser.id,
      })
    })

    typedApp.post('/sign-in', { schema: s.SignInSchema }, async (request, reply) => {
      const user = await userService.getUserByUsernameOrThrow(request.body.username)
      const secret = await secretService.createSecret(user.id, { type: 'SignIn' })
      const passed = userService.isCorrectPassword(user.id, request.body.password)

      if (!passed) throw new ErrorResponse('INCORRECT_PASSWORD')

      // SignIn 类型的 Secret 一定会有过期时间，所以这里 !
      const expiredTime = secret.deletedTime!.toISOString()
      const createdTime = secret.createdTime.toISOString()

      const token = signToken(secret.value, {
        createdTime, expiredTime, data: {
          userId: user.id,
          secretId: secret.key,
          username: user.username,
        }
      })

      // 对于浏览器，可以通过 token 设置自动登录
      reply.setCookie('token', token, {
        httpOnly: true,
        expires: secret.deletedTime!,
      })

      // 对于 API 调用，通过 token 设置 header 添加验证
      return createSuccessResponse({
        token,
        expiredTime,
        userId: user.id,
      })
    })

    app.register(async loggedApp => {
      loggedApp.register(createAuth(options))

      const loggedTypeApp = loggedApp.withTypeProvider<ZodTypeProvider>()

      loggedTypeApp.post('/sign-out', { schema: s.SignOutSchema }, async (request, reply) => {
        // 主动退出，等于删除对应的 SignIn Secret
        await secretService.deleteSecret(request.secret.key)

        // 清除现在的 token cookie
        reply.setCookie('token', '', {})

        return createSuccessResponse(null)
      })

      loggedTypeApp.post('/user/query', { schema: s.QueryUserSchema }, async () => {
        // TODO: 怎么结合权限系统使其可以查询到当前账号有权限的所有用户
        return createSuccessResponse({
          total: 0,
          list: []
        })
      })

      loggedTypeApp.post('/user/get/:userId', { schema: s.GetUserSchema }, async request => {
        // TODO: 权限
        if (request.params.userId !== request.user.id) {
          throw new ErrorResponse('NOT_PERMISSION')
        }

        const user = await userService.getUserOrThrow(request.params.userId)
        return createSuccessResponse(userService.toPlain(user))
      })

      loggedTypeApp.post('/user/delete/:userId', { schema: s.DeleteUserSchema }, async request => {
        // TODO: 权限
        if (request.params.userId !== request.user.id) {
          throw new ErrorResponse('NOT_PERMISSION')
        }

        const user = await userService.deleteUser(request.params.userId)

        // TODO: 更多相关资源的清理
        return createSuccessResponse(userService.toPlain(user))
      })
    })
  }
}
