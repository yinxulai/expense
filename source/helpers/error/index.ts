export type ErrorType =
  // common error
  | 'UNKNOWN_ERROR'
  | 'INVALID_INPUT'

  // auth error
  | 'AUTH_FAILED'
  | 'INVALID_TOKEN'
  | 'AUTH_TOKEN_EXPIRED'
  | 'INCORRECT_PASSWORD'

  // permission error
  | 'NOT_PERMISSION'

  // user error
  | 'USER_NOT_EXISTS'
  | 'USER_ALREADY_EXISTS'

export const messages: Record<ErrorType, string> = {
  'UNKNOWN_ERROR': 'Unknown error',
  'INVALID_INPUT': 'Invalid input',
  'AUTH_FAILED': 'Authentication failed',
  'INVALID_TOKEN': 'Authentication failed',
  'NOT_PERMISSION': 'Not permission',
  'INCORRECT_PASSWORD': '',
  'AUTH_TOKEN_EXPIRED': 'Authentication token expired',
  'USER_NOT_EXISTS': 'User not exists',
  'USER_ALREADY_EXISTS': 'User already exists',
}

export class ErrorResponse extends Error {
  public parent: unknown = null
  constructor(public type: Exclude<ErrorType, 'SUCCESS'>) {
    super(messages[type] || messages['UNKNOWN_ERROR'])
  }

  static isAppError(error: unknown): error is ErrorResponse {
    return error instanceof ErrorResponse
  }
}

export class UnknownErrorResponse extends ErrorResponse {
  constructor(error: unknown) {
    super('UNKNOWN_ERROR')
    this.parent = error
  }
}
