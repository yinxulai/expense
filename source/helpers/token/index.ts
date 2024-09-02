import dayJS from 'dayjs'
import * as crypto from 'node:crypto'
import jsonStringify from 'json-stable-stringify'

import { catchE } from '@helpers/catch'
import { ErrorResponse } from '@helpers/error'

export interface SignPayload {
  createdTime: string
  expiredTime?: string
  data: {
    userId: string
    username: string
    secretId: string
  }
}

/** 检查 payload 格式，不验证字段的值 */
function isValidPayload(payload: unknown): payload is SignPayload {
  return !!(
    payload
    && typeof payload === 'object'
    && 'expiredTime' in payload
    && 'data' in payload
    && payload.data
    && typeof payload.data === 'object'
    && 'userId' in payload.data
    && 'username' in payload.data
    && 'secretId' in payload.data
  )
}

export function signToken(secretValue: string, data: SignPayload): string {
  /** 之所以对 json 排序是为了避免 object key 的无序导致的签名的不稳定性 */
  const dataString = jsonStringify(data)
  const base64DataString = Buffer.from(dataString).toString('base64')

  const hmac = crypto.createHmac('sha256', secretValue)
  hmac.update(base64DataString)
  const signString = hmac.digest('base64')

  return `${signString}:${base64DataString}`
}

/** 解析 token，但是不做除了格式之外的验证和检查 */
export async function parseToken(token: string): Promise<SignPayload> {
  const tuple = token.split(':')

  if (tuple.length !== 2) throw new ErrorResponse('INVALID_TOKEN')

  const [, base64DataString] = tuple
  const dataString = Buffer.from(base64DataString, 'base64').toString()
  const [data, error] = await catchE(() => JSON.parse(dataString))
  if (data == null) throw new ErrorResponse('INVALID_TOKEN')
  if (error != null) throw new ErrorResponse('INVALID_TOKEN')
  if (!isValidPayload(data)) throw new ErrorResponse('INVALID_TOKEN')

  return data
}

/** token 是否过期 */
export function isExpiredToken(token: SignPayload): boolean {
  if (dayJS(token.expiredTime).isBefore(dayJS())) {
    return true
  }

  return false
}

/** 验证 token，包含签名检查和过期检查 */
export async function verifyToken(token: string, secretValue: string): Promise<boolean> {
  const tuple = token.split(':')

  if (tuple.length !== 2) return false
  const [signString, base64DataString] = tuple

  const hmac = crypto.createHmac('sha256', secretValue)
  hmac.update(base64DataString)
  const expectedSignString = hmac.digest('base64')

  const tokenInfo = await parseToken(token)
  if (isExpiredToken(tokenInfo)) return false

  return signString === expectedSignString
}
