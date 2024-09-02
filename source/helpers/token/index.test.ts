import dayjs from 'dayjs'
import { signToken, SignPayload, parseToken, verifyToken, isExpiredToken } from '.'

describe('@helper/token test', () => {
  it('signToken & parseToken & verifyToken should work', async () => {
    interface TestCase {
      input: {
        payload: SignPayload
        secret: [string, string]
      }
      output: {
        token: string
        expired: boolean
      }
    }

    const testCases: TestCase[] = []

    testCases.push({
      input: {
        payload: {
          // 写完整时间是为了避免发生时区转换导致输出不稳定的问题
          createdTime: dayjs('2020-12-31T16:00:00.000Z').toISOString(),
          expiredTime: dayjs('2020-12-31T16:00:00.000Z').toISOString(),
          data: {
            userId: 'test',
            username: 'test',
            secretId: 'test',
          }
        },
        secret: ['test', 'test'],
      },
      output: {
        token: 'kE/zFK+C07wzARW99wZ6YkRtd9ZqSVfBiPzpiYTGcnA=:eyJjcmVhdGVkVGltZSI6IjIwMjAtMTItMzFUMTY6MDA6MDAuMDAwWiIsImRhdGEiOnsic2VjcmV0SWQiOiJ0ZXN0IiwidXNlcklkIjoidGVzdCIsInVzZXJuYW1lIjoidGVzdCJ9LCJleHBpcmVkVGltZSI6IjIwMjAtMTItMzFUMTY6MDA6MDAuMDAwWiJ9',
        expired: true,
      }
    })

    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index]
      const result = await signToken(testCase.input.secret[1], testCase.input.payload)
      expect(result).toEqual(testCase.output.token)

      const parseTokenResult = await parseToken(result)
      expect(parseTokenResult).toEqual(testCase.input.payload)

      const verifyTokenResult = await verifyToken(result, testCase.input.secret[1])
      expect(verifyTokenResult).toEqual(!testCase.output.expired)
    }
  })

  it('isExpiredToken should work', async () => {
    for (let index = 0; index < 10; index++) {

      const isExpired = Math.random() > 0.5

      const expiredTime = isExpired
        ? dayjs().subtract(1, 'day').toISOString()
        : dayjs().add(1, 'day').toISOString()

      const result = isExpiredToken({
        expiredTime,
        createdTime: dayjs().toISOString(),
        data: {
          userId: 'test',
          username: 'test',
          secretId: 'test',
        }
      })

      expect(result).toEqual(isExpired)
    }
  })
})
