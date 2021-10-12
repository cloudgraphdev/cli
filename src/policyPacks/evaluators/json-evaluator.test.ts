import JsonEvaluator from './json-evaluator'
import { RuleResult } from '../rules-provider'

describe('JsonEvaluator', () => {
  it('should accept all rules that have a conditions field', () => {
    const e = new JsonEvaluator()

    expect(e.canEvaluate({} as any)).toBe(false)
    expect(e.canEvaluate({ conditionss: 1 } as any)).toBe(false)

    expect(e.canEvaluate({ conditions: 1 } as any)).toBe(true)
  })

  it('should execute simple rules', async () => {
    const e = new JsonEvaluator()
    const data = {
      a: 1,
      b: '1',
      c: { d: 'hello' },
      e: ['a', 'b'],
    }
    const rules = [
      { path: 'a', op: 'equal', value: 1, expected: true },
      { path: 'a', op: 'equal', value: '1', expected: true },
      { path: 'a', op: 'equal', value: '2', expected: false },
      { path: 'b', op: 'equal', value: 1, expected: true },
      { path: 'b', op: 'equal', value: '1', expected: true },
      { path: 'c', op: 'notEqual', value: 'a', expected: true },
      { path: 'a', op: 'notEqual', value: 1, expected: false },
      { path: 'a', op: 'in', value: [1, 2, 3], expected: true },
      { path: 'a', op: 'in', value: [9, 10], expected: false },
      { path: 'a', op: 'notIn', value: [2, 3], expected: true },
      { path: 'a', op: 'notIn', value: [2, 1], expected: false },
      { path: 'e', op: 'doesNotContain', value: 'hello', expected: true },
      { path: 'e', op: 'doesNotContain', value: 'a', expected: false },
    ]
    const results = []
    const expected = []
    for (const r of rules) {
      const res = await e.evaluateSingleResource(
        { conditions: r } as any,
        { data } as any
      )
      results.push(res)
      expected.push(r.expected ? RuleResult.MATCHES : RuleResult.DOESNT_MATCH)
    }
    expect(results).toStrictEqual(expected)
  })

  it('should combine simple rules', async () => {
    const e = new JsonEvaluator()
    const data = {
      a: 1,
      b: 2,
    }
    const trueRule = { path: 'a', op: 'equal', value: 1 }
    const falseRule = { path: 'a', op: 'equal', value: 99 }
    expect(
      await e.evaluateSingleResource(
        { conditions: { and: [trueRule, trueRule, trueRule] } } as any,
        { data } as any
      )
    ).toBe(RuleResult.MATCHES)
    expect(
      await e.evaluateSingleResource(
        { conditions: { and: [trueRule, trueRule, falseRule] } } as any,
        { data } as any
      )
    ).toBe(RuleResult.DOESNT_MATCH)

    expect(
      await e.evaluateSingleResource(
        { conditions: { or: [falseRule, falseRule, falseRule] } } as any,
        { data } as any
      )
    ).toBe(RuleResult.DOESNT_MATCH)
    expect(
      await e.evaluateSingleResource(
        { conditions: { or: [falseRule, trueRule, falseRule] } } as any,
        { data } as any
      )
    ).toBe(RuleResult.MATCHES)

    // nested
    expect(
      await e.evaluateSingleResource(
        {
          conditions: {
            or: [falseRule, falseRule, { and: [trueRule, trueRule] }],
          },
        } as any,
        { data } as any
      )
    ).toBe(RuleResult.MATCHES)

    expect(
      await e.evaluateSingleResource(
        {
          conditions: {
            or: [falseRule, falseRule, { and: [trueRule, falseRule] }],
          },
        } as any,
        { data } as any
      )
    ).toBe(RuleResult.DOESNT_MATCH)
  })

  it('should resolve paths', async () => {
    const e = new JsonEvaluator()
    const data = { data: { a: { b: [0, { d: 'value' }] } } } as any
    const rule = { path: 'xx', op: 'equal', value: 'value' }

    rule.path = 'a.b[1].d'
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.MATCHES)
    rule.path = 'a.b[0].d'
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.DOESNT_MATCH)

    // @ is replaced by the resource path
    data.resourcePath = '$.a.b[1]'
    rule.path = '@.d'
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.MATCHES)

    data.resourcePath = '$.a'
    rule.path = '@.b[1].d'
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.MATCHES)
  })

  it('should support array operators', async () => {
    const e = new JsonEvaluator()
    const data = { data: { a: { b: [0, 1, 2] } } } as any
    const rule = {
      path: 'a.b',
      op: 'array_any',
      value: { path: '[*]', op: 'equal', value: 2 },
    }

    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.MATCHES)

    //
    rule.op = 'array_all'
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.DOESNT_MATCH)

    rule.value.op = 'greaterThan'
    rule.value.value = -1
    expect(
      await e.evaluateSingleResource({ conditions: rule } as any, data)
    ).toBe(RuleResult.MATCHES)
  })
})
