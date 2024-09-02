import dayjs from 'dayjs'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import { Response } from 'light-my-request' // fastify 的间接依赖

import { PrismaClient } from '@prisma/client'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'

import { config } from '@helpers/config'
import { generateRandomString } from '@helpers/random'

import { createReplyHandler } from '@plugins/reply'
import { createUserRouter, createUserService } from '@modules/user'
import { createSecretService, createSecretRouter } from '@modules/secret'
import { GetUserResponse, SignInResponse, SignUpBody, SignUpResponse } from '@modules/package/schema'
import { CreateSecretBody, GetSecretResponse, ListSecretResponse } from '@modules/secret/schema'


describe('Base router test', () => {
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

  function expectSuccessResponse(response: Response) {
    expect(response.statusCode).toBe(200)
    expect(response.body).toBeDefined()

    const responseBody = response.json()
    expect(responseBody.status).toBe('SUCCESS')
    expect(responseBody.message).toBeDefined()
  }

  it('test user', async () => {
    const mockUser: SignUpBody = {
      username: generateRandomString(10),
      password: generateRandomString(10)
    }

    const signUpResponse = await fastify.inject({ method: 'POST', path: '/sign-up', body: mockUser })
    expectSuccessResponse(signUpResponse)
    const signUpData = signUpResponse.json<SignUpResponse>()
    expect(signUpData.data).toBeDefined()

    const userId = signUpData.data!.userId

    const signInResponse = await fastify.inject({ method: 'POST', path: '/sign-in', body: mockUser })
    expectSuccessResponse(signInResponse)
    const signInData = signInResponse.json<SignInResponse>()
    expect(signInData.data).toBeDefined()

    const headers = { 'Authorization': signUpData.data?.token }

    const getUserResponse = await fastify.inject({ method: 'POST', headers, path: `/user/get/${userId}` })
    expectSuccessResponse(getUserResponse)
    const getUserData = getUserResponse.json<GetUserResponse>()
    expect(getUserData.data).toBeDefined()

    const mockSecret: CreateSecretBody = {
      type: 'User',
      deletedTime: dayjs().add(1, 'day').toISOString()
    }

    const createSecretResponse = await fastify.inject({ method: 'POST', headers, path: `/secret/create/${userId}`, body: mockSecret })
    expectSuccessResponse(createSecretResponse)
    const createSecretData = createSecretResponse.json()
    expect(createSecretData.data).toBeDefined()

    const listSecretResponse = await fastify.inject({ method: 'POST', headers, path: `/secret/list/${userId}` })
    expectSuccessResponse(listSecretResponse)
    const listSecretData = listSecretResponse.json<ListSecretResponse>()
    expect(listSecretData.data).toBeDefined()
    expect(listSecretData.data!.total).toBe(1)

    const secret = listSecretData.data!.list[0]

    const getSecretResponse = await fastify.inject({ method: 'POST', headers, path: `/secret/get/${secret.key}` })
    expectSuccessResponse(getSecretResponse)
    const getSecretData = getSecretResponse.json<GetSecretResponse>()
    expect(getSecretData.data).toBeDefined()

    const disableSecretResponse = await fastify.inject({ method: 'POST', headers, path: `/secret/disable/${secret.key}` })
    expectSuccessResponse(disableSecretResponse)
    const disableSecretData = disableSecretResponse.json()
    expect(disableSecretData.data).toBeDefined()

    const deleteSecretResponse = await fastify.inject({ method: 'POST', headers, path: `/secret/delete/${secret.key}` })
    expectSuccessResponse(deleteSecretResponse)
    const deleteSecretData = deleteSecretResponse.json()
    expect(deleteSecretData.data).toBeDefined()

    const signOutResponse = await fastify.inject({ method: 'POST', headers, path: '/sign-out' })
    expectSuccessResponse(signOutResponse)
  })
})
