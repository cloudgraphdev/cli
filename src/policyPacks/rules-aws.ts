
export default [
  {
    id: 'r1',
    description: "Security Group Opens All Ports to All",
    rationale: "this is not good",
    minCount: 0,
    // this query is not the best for this rule, but I'm playing
    // ie. there can be several ec2 inst with the same sec-group
    query: `{
      queryawsEc2 {
        id
        arn
        securityGroups {
          id
          inboundRules {
            source
            portRange
            protocol
          }
        }
      }
      }`,
    // the resource that will have the finding attached
    resource: 'queryawsEc2.securityGroups',
    check:  (data: any): boolean => { // return false
      // We need to define if this mechanism query/resource covers all cases (i'm sure we'll find edge cases)
      // the object here is linearized, we'll get one check per securityGroup.
      const secGroup = data.queryawsEc2.securityGroups
      // @NOTE we access the data up to the resource as non-arrays, as there's a single chain of ownership
      // that is, data.queryawsEc2 is the ec2 we belong to, and queryawsEc2.securityGroups is this resource
      // @NOTE our child data is an array, as they belong to us arrays in general
      return secGroup.inboundRules.some((ib: any) =>
        (ib.source === '0.0.0.0/0' || ib.source === '::/0') &&
        (ib.portRange === 'all' || ib.portRange === '0-65535'))
    }

  }
]


