/* eslint-disable no-use-before-define */

import lodash from 'lodash'
import { Rule, RuleResult } from '../rules-provider'
import { ResourceData, RuleEvaluator } from './rule-evaluator'

interface SimpleCondition {
  path: string
  op: string
  value: string | number | Condition
}
interface ConnectedCondition {
  and?: Condition[]
  or?: Condition[]
}
export interface JsonRule extends Rule {
  conditions: Condition
}

export type Condition = SimpleCondition | ConnectedCondition

type Operator = (
  pathValue: any,
  value: SimpleCondition['value'],
  data: ResourceData & { elementPath?: string }
) => boolean

type _ResourceData = ResourceData & { elementPath?: string }

export default class JsonEvaluator implements RuleEvaluator<JsonRule> {
  canEvaluate(rule: JsonRule): boolean {
    return 'conditions' in rule
  }

  async evaluateSingleResource(
    rule: JsonRule,
    data: ResourceData
  ): Promise<RuleResult> {
    return this.evaluateCondition(rule.conditions, data)
      ? RuleResult.MATCHES
      : RuleResult.DOESNT_MATCH
  }

  calculatePath = (data: _ResourceData, path: string) => {
    if (path.indexOf('@') === 0) {
      // @ means the curr resource, we replace by base path
      path = path.replace('@', data.resourcePath).substr(2) // remove `$.`
    }
    if (path.indexOf('[*]') === 0 && data.elementPath) {
      // @ means the curr resource, we replace by base path
      path = path.replace('[*]', data.elementPath)
    }
    return path
  }

  resolvePath = (data: _ResourceData, path: string) => {
    return lodash.get(data.data, path)
  }

  operators: { [key: string]: Operator } = {
    equal: (a, b) => a === b, // == is fine
    notEqual: (a, b) => a !== b,
    in: (a, b) => (b as any).indexOf(a) > -1,
    notIn: (a, b) => (b as any).indexOf(a) === -1,
    contains: (a, b) => a.indexOf(b) > -1,
    doesNotContain: (a, b) => a.indexOf(b) === -1,
    lessThan: (a, b) => a < b,
    lessThanInclusive: (a, b) => a <= b,
    greaterThan: (a, b) => a > b,
    greaterThanInclusive: (a, b) => a >= b,
    array_all: (array, conditions, data) => {
      // an AND, but with every resource item
      const baseElementPath = data.elementPath

      for (let i = 0; i < array.length; i + 1) {
        if (
          !this.evaluateCondition(conditions as Condition, {
            ...data,
            elementPath: `${baseElementPath}[${i}]`,
          })
        )
          return false
      }
      return true
    },
    array_any: (array, conditions, data) => {
      // an OR, but with every resource item

      const baseElementPath = data.elementPath
      for (let i = 0; i < array.length; i + 1) {
        if (
          this.evaluateCondition(conditions as Condition, {
            ...data,
            elementPath: `${baseElementPath}[${i}]`,
          })
        )
          return true
      }
      return false
    },
  }

  evaluateCondition(condition: Condition, data: _ResourceData): boolean {
    if ('op' in condition) {
      // simple condition
      const operator = this.operators[condition.op]
      const elementPath = this.calculatePath(data, condition.path)
      const pathValue = this.resolvePath(data, elementPath)
      return operator(pathValue, condition.value, { ...data, elementPath })
    }
    // connectedConditions
    if (condition.or) {
      for (let i = 0; i < condition.or.length; i + 1) {
        // if 1 is true, it's true
        if (this.evaluateCondition(condition.or[i], data)) return true
      }
      return false
    }
    if (condition.and) {
      for (let i = 0; i < condition.and.length; i + 1) {
        // if 1 is false, it's false
        if (!this.evaluateCondition(condition.and[i], data)) return false
      }
      return true
    }
    return false
  }
}
