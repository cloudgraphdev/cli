import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

import lodash from 'lodash'

import DgraphEngine from '../storage/dgraph';
import rulesAws from "./rules-aws";


export default class RulesProvider {

  requirements = ['@cloudgraph/cg-provider-aws'] // we could use something like this

  getSchema = () => {
    const f = loadFilesSync(path.join(__dirname), {
      extensions: ['graphql'],
    });
    return f
  }

  getRules() {
    // @TODO - we need to define how this is going to be decided at runtime (configuration)
    return rulesAws
  }


  getData = async (cli: DgraphEngine) => {
    const findings: any = [];
    const rules = this.getRules()
    for(const rule of rules) {
      const { data } = await cli.query(rule.query) as any;

      const dedupeIds = {} as any;
      function dfs(currData: any, path: string[], level: number, res: any[]) {
        // dfs - base case
        if (path.length === level) {
          const resource = lodash.get(currData, path)
          if (dedupeIds[resource.id]) return
          dedupeIds[resource.id] = 1

          const result = rule.check(currData);
          const finding = {
            id: rule.id + '/' + resource.id + '/',
            ruleId: rule.id,
            resourceId: resource.id,
            result,
            // connections are easier this way for our case. we need to figure out how to set a dynamic name based on type
            securityGroup: [{id: resource.id}]
          }
          res.push(finding)
          return
        }
        // dfs - traverse
        const pathUpToLevel = path.slice(0, level + 1)
        const _subtree = lodash.get(currData, pathUpToLevel)
        const subTree = Array.isArray(_subtree)? _subtree: [_subtree];
        for(let i = 0; i < subTree.length; i++) {
          // we replace the many connections by one (remove resource uncles)
          lodash.set(currData, pathUpToLevel, subTree[i]);
          dfs(currData, path, level+1, res);
        }
        //[dfs] we'd restore original graph here, but it's not needed
      }
      const res: any[] = findings; //
      console.log('data: ', data)
      dfs(data, rule.resource.split('.'), 0, res)
      console.log(res);
    }

    return {
      connections: [],
      entities: [{
        name: 'AwsFinding',
        mutation: `mutation($input: [AddawsFindingInput!]!) {
  addawsFinding(input: $input, upsert: true) {
    numUids
  }
}`,
        data: findings
      }]
    }
  }
}
