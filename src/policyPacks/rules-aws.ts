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
  awsIamUser: 'iamUser',
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
      array_any: {
        and: [
          {
            path: '[*].source',
            in: ['0.0.0.0/0', '::/0', '68.250.115.158/32'],
          },

          { path: '[*].portRange', in: ['all', '0-65535'] },
        ],
      },
    },
    // check: (data: any): boolean => { // return false
    //   const secGroup = data.queryawsEc2['@'].securityGroups['@']; // curr resource
    //   return secGroup.inboundRules.some((ib: any) =>
    //     (ib.source === '0.0.0.0/0' || ib.source === '::/0') &&
    //     (ib.portRange === 'all' || ib.portRange === '0-65535'))
    // }
  },
  {
    id: 'r2',
    description:
      'AWS CIS 1.3 Ensure credentials unused for 90 days or greater are disabled',
    gql: `{
       queryawsIamUser {
          id
          __typename
          passwordLastUsed
          accessKeyData {
            accessKeyId
            lastUsedDate
          }
        }
      }`,
    resource: 'queryawsIamUser[*]',
    conditions: {
      or: [
        {
          // @TODO - add a and passwordEnabled
          value: { daysAgo: {}, path: '@.passwordLastUsed' },
          greaterThan: 90,
        },
        {
          path: '@.accessKeyData',
          array_any: {
            value: { daysAgo: {}, path: '[*].lastUsedDate' },
            greaterThan: 90,
          },
        },
      ],
    },
  },
] as (JsRule | JsonRule)[]