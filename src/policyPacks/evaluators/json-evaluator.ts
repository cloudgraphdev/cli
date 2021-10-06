import lodash from 'lodash'
import {Rule, RuleResult} from '../rules-provider'
import {ResourceData, RuleEvaluator} from "./rule-evaluator";
import jsonpath, { PathComponent } from 'jsonpath'

export interface JsonRule extends Rule {
  conditions: Condition;
}

export type Condition = SimpleCondition | ConnectedCondition
interface SimpleCondition {
  path: string,
  op: string,
  value: string | number | Condition
}
interface ConnectedCondition {
  and?: Condition[],
  or?: Condition[],
}
type Operator = (pathValue: any, value: SimpleCondition['value']) => boolean

export default class JsonEvaluator implements RuleEvaluator<JsonRule> {

  canEvaluate(rule: JsonRule): boolean {
    return 'conditions' in rule;
  }

  async evaluateSingleResource (rule: JsonRule, data: ResourceData): Promise<RuleResult> {
    return this.evaluateCondition(rule.conditions, data) ? RuleResult.FAIL: RuleResult.PASS
  }

  resolvePath = (data: ResourceData, path: string) => {
    if(path.indexOf('@') === 0) {
      // @ means the curr resource, we replace by base path
      path = path.replace('@', data.resourcePath).substr(2) // remove `$.`
    }
    return lodash.get(data.data, path)
  }
  operators: {[key: string]: Operator } = {
    // 'array_all',
    // 'array_any',
    // 'array_length',
    'equal':(a, b) => a == b, // == is fine
    'notEqual':(a, b) => a !== b,
    'in':(a, b) => (b as any).indexOf(a) > -1,
    'notIn':(a, b) => (b as any).indexOf(a) === -1,
    'contains':(a, b) => a.indexOf(b) > -1,
    'doesNotContain':(a, b) => a.indexOf(b) === -1,
    'lessThan':(a, b) => a < b,
    'lessThanInclusive':(a, b) => a <= b,
    'greaterThan':(a, b) => a > b,
    'greaterThanInclusive':(a, b) => a >= b,
  }

  evaluateCondition(condition: Condition, data: ResourceData): boolean {
    if ('op' in condition) {
      // simple condition
      const operator = this.operators[condition.op]
      const pathValue = this.resolvePath(data, condition.path)
      console.log(condition.op, pathValue)
      return operator(pathValue, condition.value)
    }
    // connectedConditions
    if (condition.or) {
      for (let i = 0; i < condition.or.length; i++) {
        // if 1 is true, it's true
        if (this.evaluateCondition(condition.or[i], data)) return true
      }
      return false
    }
    if (condition.and) {
      for (let i = 0; i < condition.and.length; i++) {
        // if 1 is false, it's false
        if (!this.evaluateCondition(condition.and[i], data)) return false
      }
      return true
    }
    return false
  }

}


