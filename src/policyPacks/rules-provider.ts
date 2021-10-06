import DgraphEngine from '../storage/dgraph';

import jsonpath, {PathComponent} from 'jsonpath'
import JsonEvaluator from "./evaluators/json-evaluator";
import JsEvaluator from "./evaluators/js-evaluator";
import {ResourceData, RuleEvaluator} from "./evaluators/rule-evaluator";

export interface Rule {
  id: string;
  description: string;
  rationale: string;
  gql: string;
  resource: string;
}

export enum RuleResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  MISSING = 'MISSING',
}

export interface RuleFinding {
  id: string;
  ruleId: string;
  resourceId: string;
  result: RuleResult,
  // connections ...
  // securityGroup: [{id: data.resource.id}]
}

export default class RulesProvider {
  evaluators: RuleEvaluator<any>[] = [new JsonEvaluator(), new JsEvaluator()]

  constructor(
    private rules: Rule[],
    private typenameToFieldMap: { [tn: string]: string },
    private schemaTypeName: string) {
  }

  getSchema = () => {
    const mainType = `
    enum ${this.schemaTypeName}Result {
      PASS
      FAIL
      MISSING
    }
    type ${this.schemaTypeName} @key(fields: "id") {
      id: String! @id
      ruleId: String!
      resourceId: String!
      result: ${this.schemaTypeName}Result @search
      # connections
       ${Object.keys(this.typenameToFieldMap).map((tn: string) =>
      `${this.typenameToFieldMap[tn]}: [${tn}] @hasInverse(field: findings)`).join(` `)
    }
    }
   `
    const extensions = Object.keys(this.typenameToFieldMap).map((tn: string) =>
      `extend type ${tn} {
   findings: [${this.schemaTypeName}] @hasInverse(field: ${this.typenameToFieldMap[tn]})
}`).join('\n')

    return [mainType, extensions]
  }

  getRuleEvaluators(): RuleEvaluator<any>[] {
    // @TODO - we need to define how this is going to be decided at runtime (configuration)
    return this.evaluators
  }

  getData = async (cli: DgraphEngine) => {
    const findings: any = [];
    for (const rule of this.rules) {
      try {
        const {data} = await cli.query(rule.gql) as any;
        console.log('executing rule with data', rule, data)
        const result = await this.processRule(rule, data);
        console.log('result: ', result)
        findings.push(...result)
      } catch (e) {
        console.error(e)
      }
    }

    return {
      connections: [],
      entities: [{
        name: this.schemaTypeName,
        mutation: `mutation($input: [Add${this.schemaTypeName}Input!]!) {
  add${this.schemaTypeName}(input: $input, upsert: true) {
    numUids
  }
}`,
        data: findings
      }]
    }
  }

  private processRule = async (rule: Rule, data: any) => {
    const res: any[] = []; //
    const dedupeIds = {} as any;
    const resourcePaths = jsonpath.nodes(data, rule.resource)
    const evaluator = this.getRuleEvaluator(rule)

    if (!evaluator) {
      console.warn('cant process rule - unrecognized pattern', rule)
      return []
    }

    // @NOTE: here we can evaluate things such as Data being empty (may imply rule to pass)
    // or if we have no resources, or none pass, we can decide on that rule (+ some rule field)
    for (let i = 0; i < resourcePaths.length; i++) {
      const {path, value: resource} = resourcePaths[i];
      if (!resource.id) {
        // @NOTE: we'll support more complex rules in the future where you dont need a resource upfront
        console.warn('Resource must have an id', resourcePaths[i]);
        continue
      }
      if (dedupeIds[resource.id]) {
        console.warn('Resource is duplicated, skipping', resource.id)
        continue
      }
      dedupeIds[resource.id] = 1

      if (path[0] !== '$') {
        console.log('Is this case possible? how do we process it?', resourcePaths[i]);
        continue;
      }
      const processedData = this.highlightPath(data, path);
      const ruleResult = await this.processSingleResourceRule(rule, evaluator, {
        data: processedData,
        resource,
        resourcePath: jsonpath.stringify(path)
      })
      if (ruleResult) {
        res.push(ruleResult)
      }
    }
    return res
  }

  private getRuleEvaluator = (rule: Rule) => {
    for (let evaluator of this.getRuleEvaluators()) {
      if (evaluator.canEvaluate(rule)) {
        return evaluator
      }
    }
  }
  private processSingleResourceRule = async (rule: Rule, evaluator: RuleEvaluator<any>, data: ResourceData) => {
    let result = await evaluator.evaluateSingleResource(rule, data);

    const finding = {
      id: rule.id + '/' + data.resource.id,
      ruleId: rule.id,
      resourceId: data.resource.id,
      result,
    }
    const connField = data.resource.__typename && data.resource.__typename[this.schemaTypeName]
    if (connField) {
      (finding as any)[connField] = [{id: data.resource.id}]
    }
    return finding
  }

  /**
   * traverse the path, and 'highlight' the path towards the resource
   * a[0].b.c[3].id === a['@'].b.c['@'].id // so rules can use this notation to know their parents
   */
  private highlightPath(data: any, path: PathComponent[]) {
    let curr = data // we can write the data, as next time we'll set the same fields
    for (let j = 1; j < path.length; j++) {
      const segment = path[j]
      if (Array.isArray(curr)) {
        // this is an array, we store in []._ the alias of this resource position in the array
        (curr as any)['@'] = curr[segment as number]
      }
      curr = curr[segment]
    }
    return data;
  }

}
