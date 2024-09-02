import { catchE, catchP } from '.'

describe('@helper/catch test', () => {
  it('test catchP', async () => {
    const testCases = [
      { input: Promise.reject(1), output: [undefined, 1] },
      { input: Promise.resolve(1), output: [1, undefined] },
      { input: Promise.reject({}), output: [undefined, {}] },
      { input: Promise.resolve({}), output: [{}, undefined] },
      { input: Promise.reject(null), output: [undefined, null] },
      { input: Promise.resolve(null), output: [null, undefined] },
    ]

    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index]
      const result = await catchP(testCase.input)
      expect(result).toEqual(testCase.output)
    }
  })

  it('test catchE', async () => {
    const testCases = [
      { input: () => { throw 1 }, output: [undefined, 1] },
      { input: () => { return 1 }, output: [1, undefined] },
      { input: () => { throw {} }, output: [undefined, {}] },
      { input: () => { return {} }, output: [{}, undefined] },
      { input: () => { throw null }, output: [undefined, null] },
      { input: () => { return null }, output: [null, undefined] },
    ]

    for (let index = 0; index < testCases.length; index++) {
      const testCase = testCases[index]
      const result = await catchE(testCase.input)
      expect(result).toEqual(testCase.output)
    }
  })
})
