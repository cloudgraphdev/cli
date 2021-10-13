import { Rule, RuleResult } from '../rules-provider'
import { RuleEvaluator } from './rule-evaluator'

export default class DefaultEvaluator implements RuleEvaluator<Rule> {
  canEvaluate(/* rule: Rule */): boolean {
    return true
  }

  async evaluateSingleResource(/* rule: Rule, data: ResourceData */): Promise<RuleResult> {
    // any resource captured by the query is considered as a match (and shall produce a failed finding)
    return RuleResult.MATCHES
  }
}
