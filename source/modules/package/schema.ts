import { z } from 'zod'
import { FastifySchema } from 'fastify'

import { queryBodySchema, queryResponseSchema, responseSchema } from '@helpers/schema'

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  createdTime: z.string(),
  updatedTime: z.string(),
  deletedTime: z.string().optional(),
})

export const UserFilterSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional()
})

export type User = z.TypeOf<typeof UserSchema>

export const UserIdInPathSchema = z.object({
  userId: z.string()
})

export const SignUpBodySchema = z.object({
  username: z.string(),
  password: z.string(),
})

export type SignUpBody = z.TypeOf<typeof SignUpBodySchema>

export const SignUpResponseSchema = responseSchema(z.object({
  token: z.string(),
  userId: z.string(),
  expiredTime: z.string(),
}))

export type SignUpResponse = z.TypeOf<typeof SignUpResponseSchema.default>

export const SignUpSchema = {
  body: SignUpBodySchema,
  response: SignUpResponseSchema
} satisfies FastifySchema

export const SignInBodySchema = z.object({
  username: z.string(),
  password: z.string(),
})

export type SignInBody = z.TypeOf<typeof SignInBodySchema>

export const SignInResponseSchema = responseSchema(z.object({
  token: z.string(),
  userId: z.string(),
  expiredTime: z.string(),
}))

export type SignInResponse = z.TypeOf<typeof SignInResponseSchema.default>

export const SignInSchema = {
  body: SignUpBodySchema,
  response: SignUpResponseSchema
} satisfies FastifySchema

export const SignOutBodySchema = z.null()
export const SignOutResponseSchema = responseSchema()

export type SignOutBody = z.TypeOf<typeof SignOutBodySchema>
export type SignOutResponse = z.TypeOf<typeof SignOutResponseSchema.default>

export const SignOutSchema = {
  body: SignOutBodySchema,
  response: SignOutResponseSchema
} satisfies FastifySchema

export const GetUserBodySchema = z.null()
export type GetUserBody = z.TypeOf<typeof GetUserBodySchema>

export const GetUserResponseSchema = responseSchema(UserSchema)
export type GetUserResponse = z.TypeOf<typeof GetUserResponseSchema.default>

export const GetUserSchema = {
  body: GetUserBodySchema,
  params: UserIdInPathSchema,
  response: GetUserResponseSchema
} satisfies FastifySchema

export const QueryUserBodySchema = queryBodySchema(UserFilterSchema, z.enum(['id', 'username']))
export type QueryUserBody = z.TypeOf<typeof QueryUserBodySchema>

export const QueryUserResponseSchema = queryResponseSchema(UserSchema)
export type QueryUserResponse = z.TypeOf<typeof QueryUserResponseSchema.default>

export const QueryUserSchema = {
  body: QueryUserBodySchema,
  response: QueryUserResponseSchema
} satisfies FastifySchema

export const DeleteUserBodySchema = z.null()
export type DeleteUserBody = z.TypeOf<typeof DeleteUserBodySchema>

export const DeleteUserResponseSchema = responseSchema(UserSchema)
export type DeleteUserResponse = z.TypeOf<typeof DeleteUserResponseSchema.default>

export const DeleteUserSchema = {
  body: DeleteUserBodySchema,
  params: UserIdInPathSchema,
  response: DeleteUserResponseSchema
} satisfies FastifySchema 
