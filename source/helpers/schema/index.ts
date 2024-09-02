import { z, ZodEnum, ZodType } from 'zod'

export function queryResultSchema<T extends ZodType>(t: T) {
  return z.object({
    total: z.number(),
    list: z.array(t)
  })
}

export function queryResponseSchema<T extends ZodType>(t: T) {
  return responseSchema(queryResultSchema(t))
}

export function listResponseSchema<T extends ZodType>(t: T) {
  return queryResponseSchema(t)
}

export function pagingSchema() {
  return z.object({
    size: z.number(),
    index: z.number()
  })
}


export function sortSchema<T extends ZodEnum<[string, ...string[]]>>(t: T) {
  return z.array(z.object({
    key: t,
    order: z.enum(['ASC', 'DESC'])
  }))
}

export function queryBodySchema<F extends ZodType, E extends ZodEnum<[string, ...string[]]>>(f: F, e: E) {
  return z.object({
    filter: f,
    sort: sortSchema(e),
    paging: pagingSchema()
  })
}
/**
 * 为什么 responseSchema 的 status 只能是 SUCCESS
 * 在 RouteHandler 中，任何错误只能通过 throw ErrorResponse 来抛出，这么做有以下好处：
 * 1. 足够小的接口可以限制 RouteHandler 实现更加一致
 * 2. throw ErrorResponse 可以更好的跟踪错误调用栈
 */
export function responseSchema<T extends ZodType>(t?: T) {
  return {
    default: z.object({
      message: z.string(),
      status: z.literal('SUCCESS'),
      data: t || z.null()
    })
  }
}
