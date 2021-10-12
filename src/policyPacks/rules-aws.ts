import { JsRule } from './evaluators/js-evaluator'
import { JsonRule } from './evaluators/json-evaluator'

export const ruleSchemaTypeName = 'awsFinding'
// we may autogenerate this long list
export const resourceTypeNamesToFieldsMap = {
  awsAlb: 'alb',
  awsAsg: 'asg',
  awsCloudwatch: 'cloudwatch',
  awsCloudfront: 'cloudfront',
  awsEbs: 'ebs',
  awsEip: 'eip',
  awsElb: 'elb',
  awsIgw: 'igw',
  awsKms: 'kms',
  awsLambda: 'lambda',
  awsNatGateway: 'natGateway',
  awsNetworkInterface: 'networkInterface',
  awsSecurityGroup: 'securityGroup',
  awsVpc: 'vpc',
  awsEc2: 'ec2',
  awsSqs: 'sqs',
  awsRouteTable: 'routeTable',
  awsS3: 's3',
  awsCognitoIdentityPool: 'cognitoIdentityPool',
  awsCognitoUserPool: 'cognitoUserPool',
  awsKinesisFirehose: 'kinesisFirehose',
  awsAppSync: 'appSync',
  awsCloudFormationStack: 'cloudFormationStack',
  awsCloudFormationStackSet: 'cloudFormationStackSet',
}
export default [
  {
    id: 'r1',
    description: 'Security Group Opens All Ports to All',
    rationale: 'this is not good',
    // minCount: 0,
    // this query is not the best for this rule, but I'm playing
    // ie. there can be several ec2 inst with the same sec-group
    gql: `{
      queryawsEc2 {
        id
        arn
        securityGroups {
          id
          __typename # we could try to auto-inject this one
          inboundRules {
            source
            portRange
            protocol
          }
        }
      }
      }`,
    // the resource that will have the finding attached
    resource: 'queryawsEc2[*].securityGroups[*]',
    conditions: {
      path: '@.inboundRules',
      op: 'array_any',
      value: {
        and: [
          {
            path: '[*].source',
            op: 'in',
            value: ['0.0.0.0/0', '::/0', '68.250.115.158/32'],
          },
          {
            path: '[*].portRange',
            op: 'in',
            value: ['all', '0-65535'],
          },
        ],
      },
    },
    check: (data: any): boolean => {
      // return false
      console.log('Fetching the data', data)
      const secGroup = data.queryawsEc2['@'].securityGroups['@'] // curr resource
      return secGroup.inboundRules.some(
        (ib: any) =>
          (ib.source === '0.0.0.0/0' || ib.source === '::/0') &&
          (ib.portRange === 'all' || ib.portRange === '0-65535')
      )
    },
  },
] as (JsRule | JsonRule)[]
