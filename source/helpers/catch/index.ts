
/**
 * 将 Promise<R> 转换成 [resolve:R, reject:unknown] 的形式
 */
export async function catchP<R>(p: Promise<R>): Promise<[R, unknown]> {
  const returned: [R, unknown] = [] as unknown as [R, unknown]

  await p
    .then((result) => (returned[0] = result))
    .catch((error: unknown) => (returned[1] = error))

  return returned
}

type CatchType<F extends () => unknown> = F extends () => Promise<infer R> ? R : F extends () => infer R ? R : never

/**
 * 执行函数 ()=>R 并以 [return: R, error:unknown] 的形式返回结果
 */
export async function catchE<F extends () => unknown>(f: F): Promise<[CatchType<F>, unknown]> {
  const returned: [CatchType<F>, unknown] = [] as unknown as [CatchType<F>, unknown]

  try {
    const result = f()
    if (result instanceof Promise) {
      return catchP(result)
    } else {
      returned[0] = result as CatchType<F>
    }
  } catch (error) {
    returned[1] = error
  }

  return returned
}
