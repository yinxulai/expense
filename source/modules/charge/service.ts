import crypto from 'node:crypto'
import { Prisma, PrismaClient } from '@prisma/client'

import { catchP } from '@helpers/catch'
import { ErrorResponse, UnknownErrorResponse } from '@helpers/error'

import * as s from './schema'

export type UserService = ReturnType<typeof createUserService>

export function createUserService(db: PrismaClient) {

  /** 过滤掉已经删除的用户 */
  function getDeletedUserFilter(includeDeletedUser: boolean = false) {
    // 默认不包含已删除的用户
    if (includeDeletedUser) return {}

    return {
      OR: [
        { deletedTime: { equals: null } },
        { deletedTime: { gt: new Date() } }
      ]
    }
  }

  /** 计算密码 sha256 */
  function encryptionPassword(password: string) {
    if (password == null || password === '') {
      throw new ErrorResponse('INVALID_INPUT')
    }

    const hash = crypto.createHash('sha256')
    return hash.update(password).digest('hex')
  }

  /** 验证明文密码是否与数据库一致 */
  async function isCorrectPassword(userId: string, password: string) {
    const user = await getUserOrThrow(userId)
    const hash = encryptionPassword(password)
    return user.password === hash
  }


  function toPlain<T extends Prisma.UserGetPayload<undefined>>(model: T): s.User {
    return {
      id: model.id,
      password: 'PROTECTED',
      username: model.username,
      createdTime: model.createdTime.toISOString(),
      updatedTime: model.updatedTime.toISOString(),
      deletedTime: model.deletedTime?.toISOString()
    }
  }

  function toPlains<T extends Prisma.UserGetPayload<undefined>>(models: T[]): s.User[] {
    return models.map(model => toPlain(model))
  }


  /** 创建用户 */
  async function createUser(newUser: Pick<s.User, 'password' | 'username'>) {
    const user = await getUserByUsername(newUser.username)
    if (user != null) throw new ErrorResponse('USER_ALREADY_EXISTS')
    const [result, error] = await catchP(db.user.create({ data: {
      username: newUser.username,
      password: encryptionPassword(newUser.password)
    } }))
    if (error != null) throw new UnknownErrorResponse(error)
    return result
  }

  /** 通过用户名获取用户信息 */
  async function getUserByUsername(username: string) {
    const [user, error] = await catchP(db.user.findFirst({
      where: { username, ...getDeletedUserFilter() }
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return user
  }

  async function getUserByUsernameOrThrow(username: string) {
    const user = await getUserByUsername(username)
    if (user == null) throw new ErrorResponse('USER_NOT_EXISTS')
    return user
  }

  /** 通过用户 ID 获取用户信息 */
  async function getUser(id: string) {
    const [user, error] = await catchP(db.user.findFirst({
      where: { id, ...getDeletedUserFilter() }
    }))

    if (error != null) throw new UnknownErrorResponse(error)
    return user
  }

  async function getUserOrThrow(id: string) {
    const user = await getUser(id)
    if (user == null) throw new ErrorResponse('USER_NOT_EXISTS')
    return user
  }

  /**
   * 通过用户 ID 删除用户（标记删除），同时会释放 username
   * */
  async function deleteUser(id: string) {
    const user = await getUserOrThrow(id)

    const username = `deleted_${user.username}`
    const [result, error] = await catchP(db.user.update({
      data: { deletedTime: new Date().toISOString(), username },
      where: { id }
    }))
    if (error != null) throw new UnknownErrorResponse(error)
    return result
  }

  /** 服务健康检查 */
  async function health(): Promise<boolean> {
    const [result, error] = await catchP(db.user.count({
      take: 1,
      skip: 0
    }))

    return error == null && typeof result === 'number'
  }

  return {
    health,
    getUser,
    toPlain,
    toPlains,
    deleteUser,
    createUser,
    getUserOrThrow,
    getUserByUsername,
    isCorrectPassword,
    encryptionPassword,
    getUserByUsernameOrThrow,
  }
}
