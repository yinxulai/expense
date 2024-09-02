import { ErrorType } from '@helpers/error'

type ResponseStatus = ErrorType | 'SUCCESS'

export function createResponse<S extends ResponseStatus, T>(status: S, data: T, message: string  = '') {
  return {
    data,
    status,
    message
  }
}

export function createSuccessResponse<T>(data: T) {
  return createResponse('SUCCESS', data)
}
