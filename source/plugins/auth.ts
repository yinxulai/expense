import dayJS from 'dayjs'

import { fastifyPlugin } from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest } from 'fastify'

import { UserService } from '@modules/user'
import { User } from '@modules/package/schema'
import { SecretService } from '@modules/secret'
import { Secret } from '@modules/secret/schema'

import { catchP } from '@helpers/catch'
import { LruCache } from '@helpers/cache/lru'
import { createResponse } from '@helpers/response'
import { isExpiredToken, parseToken, SignPayload, verifyToken } from '@helpers/token'

interface AuthOptions {
  userService: UserService
  secretService: SecretService
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User
    secret: Secret
    token: SignPayload
  }
}

interface TokenCache {
  expiredTime: Date
  token: SignPayload
  secret: Secret
  user: User
}

export function createAuth(options: AuthOptions): FastifyPluginAsync {
  const lcuCache = new LruCache<TokenCache>(100)
  const { userService, secretService } = options

  function getTokenFromRequest(request: FastifyRequest): string | null {
    // 手动指定的 authorization 优先级最高
    const headerToken = request.headers.authorization
    if (typeof headerToken === 'string' && headerToken) {
      const token = headerToken.replace('Bearer ', '')
      if (token) return token
    }

    // 最后是自动携带的 cookie
    const cookieToken = request.cookies.token
    if (typeof cookieToken === 'string' && cookieToken) {
      return cookieToken
    }

    return null
  }

  return fastifyPlugin(async app => {
    // use null as func or object
    app.decorateRequest('user', null)

    app.addHook('onRequest', async (request: FastifyRequest) => {
      const tokenString = getTokenFromRequest(request)

      if (tokenString == null || tokenString === '') {
        return createResponse('AUTH_FAILED', {})
      }

      // 优先从缓存中获取，避免每次重复查数据库信息
      const cachedToken = lcuCache.get(tokenString)
      if (cachedToken != null && dayJS(cachedToken.expiredTime).isAfter(dayJS())) {
        request.user = cachedToken.user
        request.token = cachedToken.token
        request.secret = cachedToken.secret
        return
      }

      const [token, error] = await catchP(parseToken(tokenString))
      if (error != null) return createResponse('AUTH_FAILED', {})

      const [secretModel, error2] = await catchP(secretService.getSecret(token.data.secretId))
      if (error2 != null) return createResponse('AUTH_FAILED', {})
      if (secretModel == null) return createResponse('AUTH_FAILED', {})


      if (!verifyToken(tokenString, secretModel.value)) {
        if (isExpiredToken(token)) {
          return createResponse('AUTH_TOKEN_EXPIRED', {})
        }

        return createResponse('AUTH_FAILED', {})
      }

      const [userModel, error3] = await catchP(userService.getUser(secretModel.userId))
      if (error3 != null) return createResponse('AUTH_FAILED', {})
      if (userModel == null) return createResponse('AUTH_FAILED', {})

      // 更新缓存，1 分钟过期
      const user = userService.toPlain(userModel)
      const secret = secretService.toPlain(secretModel)
      const expiredTime = dayJS().add(1, 'minute').toDate()
      lcuCache.set(tokenString, { user, secret, token, expiredTime })

      // 更新 request
      request.user = user
      request.token = token
      request.secret = secret
      return
    })
  })
}
