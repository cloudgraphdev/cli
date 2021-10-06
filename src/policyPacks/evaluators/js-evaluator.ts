import {Rule, RuleResult} from "../rules-provider";
import {ResourceData, RuleEvaluator} from "./rule-evaluator";

export interface JsRule extends Rule {
  check?: (data: any) => boolean;
}

export default class JsEvaluator implements RuleEvaluator<JsRule> {
  canEvaluate(rule: Rule | JsRule): boolean {
    return 'check' in rule;
  }

  async evaluateSingleResource (rule: JsRule, data: ResourceData): Promise<RuleResult> {
    return rule.check!(data) ? RuleResult.MATCHES: RuleResult.DOESNT_MATCH
  }

}
