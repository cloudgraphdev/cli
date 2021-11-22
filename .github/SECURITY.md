# Security Policy

1. [Reporting security problems to CloudGraph](#reporting)
2. [Security Point of Contact](#contact)
3. [Incident Response Process](#process)

<a name="reporting"></a>
## Reporting security problems to CloudGraph

**DO NOT CREATE AN ISSUE** to report a security problem. Instead, please
send an email to security@autocloud.dev

<a name="contact"></a>
## Security Point of Contact

The security point of contact is Tyler Dunkel. Tyler responds to security
incident reports as fast as possible, within one business day at the latest.

In case Tyler does not respond within a reasonable time, the secondary point
of contact is [Tyson Kunovsky](https://github.com/orgs/cloudgraphdev/people/kunovsky).

If neither Tyler nor Tyson responds then please contact support@github.com
who can disable any access for the CloudGraph CLI tool until the security incident is resolved.

<a name="process"></a>
## Incident Response Process

In case an incident is discovered or reported, CloudGraph will follow the following
process to contain, respond and remediate:

### 1. Containment

The first step is to find out the root cause, nature and scope of the incident.

- Is still ongoing? If yes, first priority is to stop it.
- Is the incident outside of my influence? If yes, first priority is to contain it.
- Find out knows about the incident and who is affected.
- Find out what data was potentially exposed.

One way to immediately remove all access for CloudGraph is to uninstall CloudGraph globally and/or locally using
`npm uninstall -g @cloudgraph/cli` && `npm uninstall @cloudgraph/cli`

### 2. Response

After the initial assessment and containment to out best abilities, CloudGraph will
document all actions taken in a response plan.

CloudGraph will create an RCA (Root Cause Analysis) document in the [CloudGraph documentation site](https://docs.cloudgraph.dev/overview) that describes what happened and what was done to resolve it.

### 3. Remediation

Once the incident is confirmed to be resolved, CloudGraph will summarize the lessons
learned from the incident and create a list of actions CloudGraph will take to prevent
it from happening again.

### Keep permissions to a minimum

The CloudGraph CLI tool uses the least amount of access to limit the impact of possible
security incidents, see [README - How It Works](https://github.com/cloudgraphdev/cli#how-it-works).

### Secure accounts with access

The [CloudGraph GitHub Organization](https://github.com/cloudgraphdev) requires 2FA authorization
for all members.

### Critical Updates And Security Notices

We learn about critical software updates and security threats from these sources

1. GitHub Security Alerts
2. [Snyk open source vulnerability dectection](https://snyk.io/product/open-source-security-management/)
3. GitHub: https://githubstatus.com/ & [@githubstatus](https://twitter.com/githubstatus)