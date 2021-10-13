import JsEvaluator from './js-evaluator'
import { RuleResult } from '../rules-provider'

describe('JsEvaluator', () => {
  it('should accept all rules that have a check field', () => {
    const e = new JsEvaluator()

    expect(e.canEvaluate({} as never)).toBe(false)
    expect(e.canEvaluate({ checks: 1 } as never)).toBe(false)

    // we could improve these, but following tests will pass
    expect(e.canEvaluate({ check: 1 } as never)).toBe(true)
    expect(e.canEvaluate({ check: 0 } as never)).toBe(true)
    expect(e.canEvaluate({ check: () => 1 } as never)).toBe(true)
  })

  it('should call check with data', () => {
    const e = new JsEvaluator()
    const spy = jest.fn()
    const data = 'asdf'
    e.evaluateSingleResource({ check: spy } as never, data as never)

    expect(spy).toHaveBeenCalledWith(data)
  })

  it('should return fail if rule is true', async () => {
    const e = new JsEvaluator()
    const spy = jest.fn()
    spy.mockReturnValue(false)
    expect(
      await e.evaluateSingleResource({ check: spy } as never, 0 as never)
    ).toEqual(RuleResult.DOESNT_MATCH)
    spy.mockReturnValue(true)
    expect(
      await e.evaluateSingleResource({ check: spy } as never, 0 as never)
    ).toEqual(RuleResult.MATCHES)
  })
})
