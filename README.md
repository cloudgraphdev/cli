<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/logo.png">
    <img alt="CloudGraph" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/logo.png" width="75%" style="display: block; margin: auto" />
  </a>
</p>

<br />
<br />

The universal **GraphQL** API for **AWS**, **Azure**, **GCP**, and **K8s** - query resources, relationships and insight data to solve security, compliance, asset inventory, and billing challenges. Built and maintained with love by the team at ❤️ [AutoCloud](https://www.autocloud.dev/) ❤️
<br />

🌐 [Website](https://www.cloudgraph.dev)

💻 [Documentation](https://docs.cloudgraph.dev)

💰 [Get paid to build CloudGraph providers](https://github.com/cloudgraphdev/cli/blob/master/CONTRIBUTING.md)

<br />

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
![node-current](https://img.shields.io/node/v/@cloudgraph/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
[![License](https://img.shields.io/npm/l/@cloudgraph/cli.svg)](https://github.com/cloudgraphdev/cli/blob/master/package.json)
![GitHub commit activity](https://img.shields.io/github/commit-activity/y/cloudgraphdev/cli)
![GitHub contributors](https://img.shields.io/github/contributors/cloudgraphdev/cli)
![GitHub issues](https://img.shields.io/github/issues/cloudgraphdev/cli)

<br />

<h2 align="center">Join the conversation</h2>

[![Slack](https://img.shields.io/badge/slack-chat-E01563)](https://cloudgraph-workspace.slack.com)
[![Tweet](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fcloudgraphdev%2Fcli)
](https://twitter.com/share?ref_src=twsrc%5Etfw&text=Check%20out%20CloudGraph.%20The%20GraphQL%20api%20for%20AWS,%20Azure,%20GCP,%20and%20more!)
![Twitter Follow](https://img.shields.io/twitter/follow/AutoCloudDev?style=social)

<!-- toc -->
* [Amazing companies using CloudGraph\*\*](#amazing-companies-using-cloudgraph)
* [Why CloudGraph](#why-cloudgraph)
* [How It Works](#how-it-works)
* [Authentication and Permissions](#authentication-and-permissions)
* [Install](#install)
* [Currently we support AWS CIS 1.2 and GCP CIS 1.2 but Azure and K8s are coming soon.](#currently-we-support-aws-cis-12-and-gcp-cis-12-but-azure-and-k8s-are-coming-soon)
* [Quick Start](#quick-start)
* [Loading Previous Versions](#loading-previous-versions)
* [Supported Services](#supported-services)
* [Example Queries](#example-queries)
* [Query Tools](#query-tools)
* [Community](#community)
* [Contribution Guidelines](#contribution-guidelines)
* [Deployment Options](#deployment-options)
* [Hosted Version](#hosted-version)
* [Debugging](#debugging)
* [Common Errors](#common-errors)
* [Commands](#commands)
<!-- tocstop -->

<br />

# Amazing companies using CloudGraph\*\*

- [AWS](https://aws.amazon.com/)
- [Microsoft](https://www.microsoft.com/)
- [Oracle](https://www.oracle.com/index.html)
- [IBM](https://www.ibm.com/us-en/)
- [NASA](https://www.nasa.gov/)
- [Grafana](https://grafana.com/)
- [Pinterest](https://www.pinterest.com/)
- [Zendesk](https://www.zendesk.com/)
- [McKinsey](https://www.mckinsey.com/)
- [Pulumi](https://www.pulumi.com/)
- [Siemens](https://www.siemens.com/)
- [MasterCard](https://www.mastercard.us/en-us.html)

\*\* usage does not imply endorsement

# Why CloudGraph

AWS, Azure, and GPC have done a wonderful job of building solutions that let engineers like us create systems to power our increasingly interconnected world. Over the last 15 years, products such as EC2, S3, RDS, and Lambda have fundamentally changed how we think about computing, storage, and databasing.

<br />

With the proliferation of Kubernetes and Serverless in the last 5 or so years, cloud services have become increasingly abstract on top of racks of physical servers. To end-users, everything on the cloud is just an API, so we don't necessarily need to know how Lambda Functions or EKS work under the hood to be able to use them for building applications. With a little documentation, API or console access, and a tutorial anyone can pretty much create anything they need.

<br />

These abstractions have led to massive improvements in the overall convenience and breadth of CSP service offerings. What was once a painstaking, time-consuming, and error-prone process of provisioning new servers, databases, or filesystems can now be done in seconds with just the click of a button or deployment of IAC. Since everything is just an API abstraction, when a CAP is ready to introduce a new "product" they simply need to expose a new API - yes, I'm of course simplifying slightly :)

<br />

Anyone familiar with the CSPs knows that service APIs are almost always split into modular namespaces that contain dozens, if not hundreds, of separate API methods for single resources. For example, the AWS EC2 service contains over 500 different API methods, with new ones added occasionally. Any company building substantial systems on a CSP is likely using many, many different services.

<br />

While a masterpiece of datacenter architecture, this choice of hundreds of services and configuration options put the burden of knowledge on how to properly use these services squarely on us engineers. As a result, we find ourselves having to constantly stay up to date and learn about all the service offerings or new changes. This takes a significant amount of time and mental energy. As developers, it can be difficult, time-consuming, and frustrating to use the AWS CLI to make 5 different API calls to describe, as an example, an AWS ECS cluster, its services, task definitions, tasks, container definitions, etc. We often find ourselves lost in documentation and having to use half a dozen of APIs to get answers to questions like "What exactly is running in this VPC?"

<br />

This means that AWS, Azure, and GCP can feel overwhelming quickly even to seasoned cloud architects. While the CSPs are fantastic at building the actual services that power our businesses, not a lot of headway has been into simplifying the day-to-day UX of querying these hundreds of services in a sane manner.

<br />

New solutions like the Cloud Control API for AWS have attempted to create a standardized interface for querying many different types of AWS resources. Unfortunately, the Cloud Control API's usage is severely limited, and users still need to know how to correctly query their data. This means more time spent reading documentation and understanding how services work and are related to one another.

<br />

While the modularity of the CSP APIs is a great logical organization system and does make sense, it's a burden on end-users in terms of the cognitive overhead and learning curve. Having to remember how hundreds of constantly changing services work and are connected leads to a caffeine addiction and time wasted playing detective.

<br />

Wouldn't it be great if we as DevOps/Cloud engineers had a simpler way to get our data out of AWS, Azure, GCP and the others? One that reflected our need to easily query any data about any service in any account without having to spend hours on docs or stack overflow?

<br />

It is for these reasons that we built CloudGraph, the GraphQL API for everything cloud. CloudGraph extracts, normalizes, processes, and enriches your cloud data allowing you to access deep insights across multiple providers effortlessly. Check out our blog post [The GraphQL API for everything](https://www.autocloud.dev/blog/the-graphql-api-for-all-clouds) to learn more.

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/exampleQueries.gif">
    <img alt="example queries" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/exampleQueries.gif" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

# How It Works

Note that CloudGraph requires **READ ONLY** permissions to run and as such can **never** mutate your actual cloud infrastructure. Additionally, none of your cloud environment information is ever sent to or shared with CloudGraph, AutoCloud, or any other third parties.

<br />

Under the hood, CloudGraph reaches out to your cloud provider(s), sucks up all of the configuration data, processes it, and stores a copy of this data for you in [Dgraph](https://dgraph.io/). It then exposes an endpoint at `http://localhost:8997` that allows you to write GraphQL Queries against your stored data. These queries not only allow you do to anything that you would do with say, the AWS SDK/CLI, but they also allow you to run much more powerful queries as well. CloudGraph ships with pre-packaged GraphQL query tools including [GraphQL Playground](https://github.com/graphql/graphql-playground) and [Altair](https://github.com/altair-viz/altair) but you can also feel free to use your own. It also includes a schema visualization tool called [Voyager](https://github.com/APIs-guru/graphql-voyager) so you can understand relationships between entities.

<br />

# Authentication and Permissions

CloudGraph currently supports AWS, Azure, GCP, and K8s (several others coming soon). CloudGraph needs read permissions in order to ingest your data. To keep things easy you can use the same permissions that we use internally when we run CloudGraph to power AutoCloud. Here are the auth guides and details for how to generate credentials for each provider (feel free to leave out AutoCloud specific configuration):

<br />

- [AWS Docs](https://docs.autocloud.dev/aws-account)
- [Azure Docs](https://docs.autocloud.dev/azure-subscription)
- [GCP Docs](https://docs.autocloud.dev/gcp-project)
- [K8s Docs](https://github.com/cloudgraphdev/cloudgraph-provider-kubernetes)

<br />

# Install

<!-- install -->

**System Requirements**

- Docker

There are 2 ways to install the CloudGraph CLI

### Homebrew (Recommended)

You can install CloudGraph using homebrew with the following command:
`brew install cloudgraphdev/tap/cg`

### NPM

- Requires Node 16+

Use this command to install and update CloudGraph to the latest version.

```bash
npm i -g @cloudgraph/cli
```

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/install.gif">
    <img alt="install" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/install.gif" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br/>

You can then add the providers you want (links to provider repos: [AWS](https://github.com/cloudgraphdev/cloudgraph-provider-aws), [Azure](https://github.com/cloudgraphdev/cloudgraph-provider-azure), [GCP](https://github.com/cloudgraphdev/cloudgraph-provider-gcp), [K8s](https://github.com/cloudgraphdev/cloudgraph-provider-k8s)):

```bash
cg init aws
cg init azure
cg init gcp
cg init k8s
```

You can also add as many as you want all at once

```bash
cg init aws azure gcp k8s
```

And add in compliance policy packs to supplement your data with instant security insights:

```bash
# Currently we support AWS CIS 1.2 and GCP CIS 1.2 but Azure and K8s are coming soon.
cg policy add aws-cis-1.2.0
cg policy add gcp-cis-1.2.0
```

You can find a list of currently supported policy packs in the [Policy Packs repo](https://github.com/cloudgraphdev/cloudgraph-policy-packs)

<!-- installstop -->

<br />

# Quick Start

You can get up and running with three simple commands:

<br />

<!-- quickstart -->

```bash
cg init
```

1. This initializes CloudGraph's configuration. This command will ask you a series of questions about what providers you are using and how you would like CloudGraph configured.

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/init.gif">
    <img alt="init" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/init.gif" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br/>

---

<br/>

```bash
cg launch
```

<br/>

2. This command launches an instance of [Dgraph](https://dgraph.io/), the graphdb CloudGraph uses to store data under the hood. Note that there are 2 ways to launch an instance. **BOTH** of these require [Docker](https://www.docker.com/) to be installed and running. The preferred solution is to use our `cg launch` convenience command.

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/launch.gif">
    <img alt="launch" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/launch.gif" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

Note that if you do not want to use this command, for example, if you want to launch the Dgraph container in interactive mode, you can use the docker command below.

```bash
  docker run -it -p 8995:5080 -p 8996:6080 -p 8997:8080 -p 8998:9080 -p 8999:8000
  --label cloudgraph-cli-dgraph-standalone -v ~/dgraph:/dgraph --name dgraph dgraph/standalone:v21.03.1
```

---

<br/>

```bash
cg scan
```

<br/>

3. Scan for cloud infrastructure for all configured providers. This command will reach out and read all of the metadata on your cloud infrastructure. Note that it is **completely normal** to see warnings and errors while the `cg scan` command runs, these are usually caused by permissions issues. That said, if you encounter any problematic errors running CloudGraph you can prepend `CG_DEBUG=5` to the beginning of your command as in, `CG_DEBUG=5 cg scan`. This will print out the verbose logs with more information and save the output to `cg-debug.log`. Please share your logs with us either by opening an [issue on GitHub](https://github.com/cloudgraphdev/cli/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) or let us know in our [Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-ytjemoz7-yKWwElynDp1eHAAB55sbpg).

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/scan.gif">
    <img alt="scan" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/scan.gif" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

That's it, you are all set to start querying! The query tool you selected during the `cg init` command will then be opened in your preferred browser to run queries, mutations, and visualizations on all of your cloud infrastructure! Note that if you installed any policy packs, such as AWS CIS 1.2, policy pack insight data will be automatically added to your cloud data!

<br/>

Note that you may also use **any** GraphQL query tool you would like by connecting it to http://localhost:8997/graphql.

<!-- quickstartstop -->

<br />

## Stopping the Dgraph instance

<br />

To stop the Dgraph instance(stop the dgraph container) run:

<br />

```bash
cg teardown
```

<br />

Additionally if you wish to remove the container after stopping it, run:

<br />

```bash
cg teardown --delete-image
```

<br />

# Loading Previous Versions

<br />

CloudGraph stores as many previous versions of your data as you configured in the `cg init` command. In order to load and query a previous version of your data simply run the `cg load` command and select the version of your data you wish to inspect like so:

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/load.png">
    <img alt="load" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/load.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

# Supported Services

<br />

You can find the list of services currently supported for each provider in the following provider repos:

[AWS Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-aws)

[Azure Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-azure)

[GCP Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-gcp)

[K8s Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-k8s)

<br />

<!-- examplesqueries -->

# Example Queries

Link to full documentation: https://docs.cloudgraph.dev/overview.

To use CloudGraph, you will need to be familiar with [GraphQL](https://graphql.org/). This section contains a handful of example queries to get you up and running but is by no means exhaustive. If you can dream it up, you can query it! Note that you can find **hundreds** of additional example queries in the [documentation](https://docs.cloudgraph.dev/overview).

<br />

## Basic Query Syntax Examples:

_Note: this section will focus on AWS, but the same ideas apply other provider like Azure and GCP_

To explain how CloudGraph works consider the following query that you can run to get the `ID` and `ARN` of a single `EC2 instance`. Note that for the purposes of these examples we will just request the `IDs` and `ARNs` of AWS resources to keep things terse, but you can query whatever attributes you want:

<br />

```graphql
query {
  getawsEc2(
    arn: "arn:aws:ec2:us-east-1:123445678997:instance/i-12345567889012234"
  ) {
    id
    arn
  }
}
```

<br />

This query will return a `JSON` payload that looks like this. All of the following examples will follow suit:

<br />

```json
{
  "data": {
    "getawsEc2": {
      "id": "i-12345567889012234",
      "arn": "arn:aws:ec2:us-east-1:123445678997:instance/i-12345567889012234"
    }
  },
  "extensions": {
    "touched_uids": 4
  }
}
```

<br />

Get the `ID` and `ARN` of each `EC2` in **all** the AWS accounts you have scanned:

```graphql
query {
  queryawsEc2 {
    id
    arn
  }
}
```

<br />

Get the `ID` and `ARN` of all `EC2` instances in **one** of your AWS accounts by filtering the accountId:

```graphql
query {
  queryawsEc2(filter: { accountId: { eq: "123456" } }) {
    id
    arn
  }
}
```

<br />

Get the `ID` and `ARN` of each `EC2` in `"us-east-1"` using a regex to search the `ARN`:

```graphql
query {
  queryawsEc2(filter: { arn: { regexp: "/.*us-east-1.*/" } }) {
    id
    arn
  }
}
```

<br />

Do the same thing but checking to see that the `region` is equal to `"us-east-1"` instead of using a regex:

```graphql
query {
  queryawsEc2(filter: { region: { eq: "us-east-1" } }) {
    id
    arn
  }
}
```

<br />

Do the same thing but checking to see that the `region` contains `"us-east-1"` in the name instead of using eq:

```graphql
query {
  queryawsEc2(filter: { region: { in: "us-east-1" } }) {
    id
    arn
  }
}
```

<br />

Get the `ID` and `ARN` of each `M5` series `EC2 instance` in `"us-east-1"`

```graphql
query {
  queryawsEc2(
    filter: { region: { eq: "us-east-1" }, instanceType: { regexp: "/^m5a*/" } }
  ) {
    id
    arn
  }
}
```

<br />

Do the same thing but skip the first found result (i.e. `offset: 1`) and then only return the first two results after that (i.e. `first: 2`) and order those results by AZ in ascending order (`order: { asc: availabilityZone }`) so that instance(s) in `"us-east-1a"` are returned at the top of the list.

```graphql
query {
  queryawsEc2(
    filter: { region: { eq: "us-east-1" }, instanceType: { regexp: "/^m5a*/" } }
    order: { asc: availabilityZone }
    first: 2
    offset: 1
  ) {
    id
    arn
  }
}
```

<br />

Do the same thing but also include the `EBS Volume` that is the boot disk for each `EC2 instance`:

```graphql
query {
  queryawsEc2(
    filter: { region: { eq: "us-east-1" }, instanceType: { regexp: "/^m5a*/" } }
    order: { asc: availabilityZone }
    first: 2
    offset: 1
  ) {
    id
    arn
    ebs(filter: { isBootDisk: true }, first: 1) {
      id
      arn
      isBootDisk
    }
  }
}
```

<br />

Do the same thing, but also include the `SGs` and `ALBs` for each `EC2`. For the `ALBs`, get the `EC2s` that they are connected to along with the `ID` and `ARN` of each found `EC2 instance` (i.e. a circular query).

```graphql
query {
  queryawsEc2(
    filter: { region: { eq: "us-east-1" }, instanceType: { regexp: "/^m5a*/" } }
    order: { asc: availabilityZone }
    first: 2
    offset: 1
  ) {
    id
    arn
    ebs(filter: { isBootDisk: true }, first: 1) {
      id
      arn
      isBootDisk
    }
    securityGroups {
      id
      arn
    }
    alb {
      id
      arn
      ec2Instance {
        id
        arn
      }
    }
  }
}
```

<br />

Get each `VPC`, the `ALBs` and `Lambdas` in that `VPC`, and then a bunch of nested sub-data as well. Also get each `S3 Bucket` in `us-east-1`. Also get the `SQS` queue with an `ARN` of `arn:aws:sqs:us-east-1:8499274828484:autocloud.fifo` and check the `approximateNumberOfMessages`. You get the idea, CloudGraph is **extremely** powerful.

```graphql
query {
  queryawsVpc {
    id
    arn
    alb {
      id
      arn
      ec2Instance {
        id
        arn
        ebs(filter: { isBootDisk: true }) {
          id
          arn
        }
      }
    }
    lambda {
      id
      arn
      kms {
        id
        arn
      }
    }
  }
  queryawsS3(filter: { region: { eq: "us-east-1" } }) {
    id
    arn
  }
  getawsSqs(arn: "arn:aws:sqs:us-east-1:8499274828484:autocloud.fifo") {
    approximateNumberOfMessages
  }
}
```

<br />

## AWS security, compliance, and governance examples:

CloudGraph Policy Packs guarantee compliance across existing infrastructure for a given cloud provider. Packs are based on sets of rules/benchmarks provided by security organizations like the Center for Internet Security with the objective of keeping your infrastructure up-to-date with industry security standards. Once you have added a policy pack using the `cg policy add` command (i.e. `cg policy add aws-cis-1.2.0`) each time you run a scan CloudGraph will _automatically_ execute your configured policies. Those results will be stored at Dgraph and linked to your existing resources, making it easy to query your compliance results alongside your resources.

For more information on currently available policy packs please visit our [Policy Packs repo](https://github.com/cloudgraphdev/cloudgraph-policy-packs)

<br />

Use the CloudGraph Policy Pack for AWS CIS 1.2 to query all of your CIS findings for all of your AWS Accounts:

```graphql
query {
  queryawsCISFindings {
    ruleId
    description
    result
    severity
  }
}
```

<br />

If you want to query several different compliance findings for a given provider like AWS at once, you can request them like this:

```graphql
query {
  queryawsFindings {
    CISFindings {
      severity
      description
      ruleId
      result
    }
    AutoCloudFindings {
      severity
      description
      ruleId
      result
    }
  }
}
```

<br />

For each CIS rule, get the resources that the rule is associated with, in this case we are quering IAM user's data to see which pass and fail:

```graphql
query {
  queryawsCISFindings {
    ruleId
    description
    result
    severity
    iamUser {
      id
      arn
      name
    }
  }
}
```

<br />

If you wanted to understand the CIS rules that apply to a particular IAM User you could use the following query:

```graphql
query {
  getawsIamUser(id: "123456789") {
    name
    CISFindings {
      severity
      description
      ruleId
      result
    }
  }
}
```

<br />

Even if you don't have any policy packs installed, you can still write powerful security queries like this to find all the unencrypted `EBS Volumes`:

```graphql
query {
  queryawsEbs(filter: { encrypted: false }) {
    id
    arn
    availabilityZone
    encrypted
  }
}
```

<br />

Find all the public `S3 Buckets`:

```graphql
query {
  queryawsS3(filter: { access: { eq: "Public" } }) {
    id
    arn
    access
  }
}
```

<br />

Find all the `S3 Buckets` that are themselves public or that can have Objects that are public in them:

```graphql
query {
  queryawsS3(filter: { not: { access: { eq: "Private" } } }) {
    id
    arn
    access
  }
}
```

<br />

Find all the `KMS` keys in `"us-east-1"`:

```graphql
query {
  queryawsKms(filter: { arn: { regexp: "/.*us-east-1.*/" } }) {
    id
    arn
    description
    keyRotationEnabled
    tags {
      key
      value
    }
  }
}
```

<br />

Find all the burstable `T` series instances:

```graphql
query {
  queryawsEc2(filter: { instanceType: { regexp: "/^t.*/" } }) {
    id
    arn
    availabilityZone
    instanceType
  }
}
```

<br />

Find the default `VPCs`:

```graphql
query {
  queryawsVpc(filter: { defaultVpc: true }) {
    id
    arn
    defaultVpc
    state
  }
}
```

<br />

Find the public `ALBs`:

```graphql
query {
  queryawsAlb(filter: { scheme: { eq: "internet-facing" } }) {
    id
    arn
    dnsName
    createdAt
    tags {
      key
      value
    }
  }
}
```

<br />

Find all of the `EC2s`, `Lambdas`, and `VPCs` that have a `Tag` value of `"Production"`:

```graphql
query {
  queryawsTag(filter: { value: { eq: "Production" } }) {
    key
    value
    ec2Instance {
      id
      arn
    }
    lambda {
      id
      arn
    }
    vpc {
      id
      arn
    }
  }
}
```

<br />

Do the same thing but look for both a `key` and a `value`:

```graphql
query {
  queryawsTag(
    filter: { key: { eq: "Environment" }, value: { eq: "Production" } }
  ) {
    key
    value
    ec2Instance {
      id
      arn
    }
    lambda {
      id
      arn
    }
    vpc {
      id
      arn
    }
  }
}
```

<br />

Do the same thing using `getawsTag` instead of `queryawsTag`. Note that when searching for tags using `getawsTag` your must specify **both** the `key` and `value` as the `id` like is done below with `"Environment:Production"`:

```graphql
query {
  getawsTag(id: "Environment:Production") {
    key
    value
    ec2Instance {
      id
      arn
    }
    lambda {
      id
      arn
    }
    vpc {
      id
      arn
    }
  }
}
```

<br />

## AWS FinOps examples:

<br />

Note that billing data is currently only available for AWS. In order to successfully ingest FinOps related data you must have the Cost Explorer API enabled in your AWS Account. [You can view how to do that here](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-access.html)

<br />

Get the `total cost` of your AWS Account for the `last 30 days`, the `total cost` of your AWS Account `month to date`, a breakdown of `each service and its cost for the last 30 days`, and a breakdown of `each service and its cost month to date` as well as the `monthly` and `month to date` average costs:

```graphql
query {
  queryawsBilling {
    totalCostLast30Days {
      cost
      currency
      formattedCost
    }
    totalCostMonthToDate {
      cost
      currency
      formattedCost
    }
    monthToDate {
      name
      cost
      currency
      formattedCost
    }
    last30Days {
      name
      cost
      currency
      formattedCost
    }
    monthToDateDailyAverage {
      name
      cost
      currency
      formattedCost
    }
    last30DaysDailyAverage {
      name
      cost
      currency
      formattedCost
    }
  }
}
```

<br />

This query will return a `JSON` payload that looks like this:

```json
{
  "data": {
    "queryawsBilling": [
      {
        "totalCostLast30Days": {
          "cost": 7088.87,
          "currency": "USD",
          "formattedCost": "$7088.87"
        },
        "totalCostMonthToDate": {
          "cost": 7089.28,
          "currency": "USD",
          "formattedCost": "$7089.28"

        },
        "monthToDate": [
          {
            "name": "Amazon Relational Database Service",
            "cost": 548.68,
            "currency": "USD",
            "formattedCost": "$548.68"
          },
          {
            "name": "Amazon Managed Streaming for Apache Kafka",
            "cost": 67.49,
            "currency": "USD",
            "formattedCost": "$67.49"
          },
          {
            "name": "Amazon OpenSearch Service",
            "cost": 1155.04,
            "currency": "USD",
            "formattedCost": "$1155.04"
          }
          ...More Services
        ],
        "last30Days": [
          {
            "name": "AWS Step Functions",
            "cost": 330.20,
            "currency": "USD",
            "formattedCost": "$330.20"
          },
          {
            "name": "Amazon Elastic Container Service for Kubernetes",
            "cost": 194.40,
            "currency": "USD",
            "formattedCost": "$194.40"
          },
          {
            "name": "AmazonCloudWatch",
            "cost": 310.54,
            "currency": "USD",
            "formattedCost": "$310.54"
          }
          ...More Services
        ],
        "monthToDateDailyAverage": [
          {
            "name": "Amazon Relational Database Service",
            "cost": 54.86,
            "currency": "USD",
            "formattedCost": "$54.86"
          },
          {
            "name": "Amazon Managed Streaming for Apache Kafka",
            "cost": 6.74,
            "currency": "USD",
            "formattedCost": "$6.74"
          },
          {
            "name": "Amazon OpenSearch Service",
            "cost": 115.50,
            "currency": "USD",
            "formattedCost": "$115.50"
          }
          ...More Services
        ],
        "last30DaysDailyAverage": [
          {
            "name": "AWS Step Functions",
            "cost": 33.01,
            "currency": "USD",
            "formattedCost": "$33.01"
          },
          {
            "name": "Amazon Elastic Container Service for Kubernetes",
            "cost": 19.44,
            "currency": "USD",
            "formattedCost": "$19.44"
          },
          {
            "name": "AmazonCloudWatch",
            "cost": 31.05,
            "currency": "USD",
            "formattedCost": "$31.05"
          }
          ...More Services
        ],
      }
    ]
  },
  "extensions": {
    "touched_uids": 212
  }
}
```

<br />

Get each `EC2 instance` in your AWS account along with its daily cost:

```graphql
query {
  queryawsEc2 {
    arn
    dailyCost {
      cost
      currency
      formattedCost
    }
  }
}
```

<br />

This query will return a `JSON` payload that looks like this. All of the following examples will follow suit:

```json
{
{
  "data": {
    "queryawsEc2": [
      {
        "arn": "arn:aws:ec2:us-east-1:12345678910:instance/i-0c8b3vhfgf8df923f",
        "dailyCost": {
          "cost": 2.06,
          "currency": "USD",
          "formattedCost": "$2.06"
        }
      },
      {
        "arn": "arn:aws:ec2:us-east-1:12345678910:instance/i-060b3dsfds7sdf62e3",
        "dailyCost": {
          "cost": 2.06,
          "currency": "USD",
          "formattedCost": "$2.06"
        }
      },
     ...More EC2 Instances
    ]
  },
  "extensions": {
    "touched_uids": 28
  }
}
```

<br />

Get each `NAT Gateway` in your AWS account along with its daily cost:

```graphql
query {
  queryawsNatGateway {
    arn
    dailyCost {
      cost
      currency
      formattedCost
    }
  }
}
```

<br />

## AWS CloudWatch example:

CloudGraph ingests your CloudWatch Metric data and stores it along with select AWS services. This feature is currently in beta and will work for EC2 only:

```graphql
query {
  queryawsEc2 {
    arn
    cloudWatchMetricData {
      lastWeek {
        cpuUtilizationAverage
        networkInAverage
        networkOutAverage
        networkPacketsInAverage
        networkPacketsOutAverage
        statusCheckFailedSum
        statusCheckFailedInstanceSum
        statusCheckFailedSystemSum
        diskReadOpsAverage
        diskWriteOpsAverage
        diskReadBytesAverage
        diskWriteBytesAverage
      }

      lastMonth {
        cpuUtilizationAverage
        networkInAverage
        networkOutAverage
        networkPacketsInAverage
        networkPacketsOutAverage
        statusCheckFailedSum
        statusCheckFailedInstanceSum
        statusCheckFailedSystemSum
        diskReadOpsAverage
        diskWriteOpsAverage
        diskReadBytesAverage
        diskWriteBytesAverage
      }
      last6Hours {
        cpuUtilizationAverage
        networkInAverage
        networkOutAverage
        networkPacketsInAverage
        networkPacketsOutAverage
        statusCheckFailedSum
        statusCheckFailedInstanceSum
        statusCheckFailedSystemSum
        diskReadOpsAverage
        diskWriteOpsAverage
        diskReadBytesAverage
        diskWriteBytesAverage
      }
      last24Hours {
        cpuUtilizationAverage
        networkInAverage
        networkOutAverage
        networkPacketsInAverage
        networkPacketsOutAverage
        statusCheckFailedSum
        statusCheckFailedInstanceSum
        statusCheckFailedSystemSum
        diskReadOpsAverage
        diskWriteOpsAverage
        diskReadBytesAverage
        diskWriteBytesAverage
      }
    }
  }
}
```

<br />

## Thinking in terms of a graph:

<br />

When you think, "in terms of a graph", you can do almost anything with CloudGraph. Say for example that you want to know what Lamba functions don't belong to a VPC (i.e. they don't leverage VPC networking). Because CloudGraph connects all resources that have relationships, such as VPC parents to their Lambda children, you are able to answer this question easily. Simply check to see what lambda functions the VPC is "connected" to, and compare that against the list of all lambda functions like so:

```graphql
query {
  queryawsVpc {
    id
    arn
    lambda {
      id
      arn
    }
  }
  queryawsLambda {
    id
    arn
  }
}
```

<br />

## Limitations

<br />

Today, the biggest limitation with CloudGraph and our query abilities is we don't support nested filtering based on child attributes. So for example, as cool as it would be to do the following, it's just not possible yet:

<br />

```graphql
query {
  # This won't work just yet...
  queryawsEc2(filter: { ebs: { isBootDisk: true } }) {
    id
    arn
    ebs {
      id
      arn
    }
  }
  # So you have to do this instead :(
  queryawsEc2 {
    id
    arn
    ebs(filter: { isBootDisk: true }) {
      id
      arn
    }
  }
}
```

This is actually not a limitation of CloudGraph, but rather a feature that still needs to be implemented with Dgraph. [You can view and comment on the discussion thread here](https://discuss.dgraph.io/t/proposal-nested-object-filters-for-graphql-rewritten-as-var-blocks-in-dql/12252/2)

<!-- examplesqueriesstop -->

<br />

# Query Tools

<!-- querytools -->

CloudGraph ships with 2 awesome query tools and a GraphQL schema explorer. Remember, you can use **ANY** GraphQL query tool if you would prefer another option, just connect it to your exposed `/graphql` endpoint!

<br />

## [GraphQL Playground](https://github.com/graphql/graphql-playground)

GraphQL playground has a fluid and engaging UX that is great for querying a GraphQL schema quickly and simply. It has built-in automatically generated documentation and auto-completion while you type. To access playground, either select it as your preferred query tool in the `init` command OR visit `/playground` in the server CG spins up.

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlPlayground.png">
    <img alt="gqlPlayground" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlPlayground.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

## [Altair](https://github.com/altair-graphql/altair)

Altair is another great GraphQL query tool that packs a ton of [features](https://github.com/altair-graphql/altair#features) for power users. Do things like autocomplete queries, dynamically add fragments, and export/import collections of queries. To access Altair, either select it as your preferred query tool in the `init` command OR visit `/altair` in the server CG spins up.

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlAltair.png">
    <img alt="gqlAltair" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlAltair.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

## [Voyager](https://github.com/APIs-guru/graphql-voyager)

GraphQL Voyager is an awesome way to explore the schema(s) for your CG providers. It gives you a great bidirectional chart containing all your types and queries. You can click entities or arrows to discover connections, search for something specific, and get a deeper understanding of your schema. To access voyager, visit `/voyager` in the server CG spins up.

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/voyager.png">
    <img alt="voyager" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/voyager.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<!-- querytoolsstop -->

<br />

# Community

<br />

Comments, questions, or feedback? Please [Join Our Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-ytjemoz7-yKWwElynDp1eHAAB55sbpg) we would love to hear from you.

<br />

# Contribution Guidelines

If you're interested in contributing to CloudGraph please check out our [Contribution Guidelines](https://github.com/cloudgraphdev/cli/blob/master/CONTRIBUTING.md).

<br />

# Deployment Options

You can either run CloudGraph locally, or you can deploy it to your cloud provider of choice. Terraform modules and guides for cloud deployments are coming soon!

<br />

# Hosted Version

Interested in a fully managed SaaS/self hosted version of CloudGraph that has built in 3D visualization capabilities, automated scans, and hundreds of additional compliance checks? Check out [AutoCloud](https://www.autocloud.dev) for more details.

<br />

<p align="center">
  <a href="https://www.autocloud.dev">
    <img alt="autocloud" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/autoCloud.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

# Debugging

If you encounter any errors running CloudGraph you can prepend `CG_DEBUG=5` to the beginning of your command as in, `CG_DEBUG=5 cg scan`. This will print out the verbose logs with more information that you can then use to either open an [issue on GitHub](https://github.com/cloudgraphdev/cli/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) or let us know in our [Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-ytjemoz7-yKWwElynDp1eHAAB55sbpg).

<br />

# Common Errors

There are some common errors you may see when running CloudGraph that are usually related to permisions or connection issues.

- ⚠️ unable to make some connections - This warning in the scan report appears when CG tries to make a connection between two resources and is unable to do so. If you see this using one of CG's offically supported providers, please [create a new issue](https://github.com/cloudgraphdev/cli/issues) so we can solve it. The most common cause of this error is a bug in the underlying provider's resource connection logic.

- 🚫 unable to store data in Dgraph - This error in the scan report appears when CG tries to insert some cloud provider data into the graph DB and it fails. Any services with this error will be unable to be queried in the GraphQL query tool. This usually happens when CG is unable to grab required data (such as an arn) for a resource due to an error when calling the provider SDK, commonly due to a lack of authorization.

- Provider {name}@${version} requires cli version {version} but cli version is ${version} - This warning means you have incompatible versions of CG and the provider you are trying to use. Try updating CG `npm install -g @cloudgraphdev/cli` and the provider module `cg provider update` so both are at the latest version. You can also check the proivder's `pacakge.json` to see what versions of CG support it.

- Manager failed to install plugin for {provider} - This error occurs when CG's plugin manager can not find the provider module you want to use. The manager searches the public NPM registry for the provider module. For offically supported providers, just pass the provider name `CG init aws`. For community supported providers, you must pass the namespace as well `CG init @{providerNamespace}/{provider}`

<br />

# Commands

<!-- commands -->
* [`cg help [COMMAND]`](#cg-help-command)
* [`cg init [PROVIDER]`](#cg-init-provider)
* [`cg launch [PROVIDER]`](#cg-launch-provider)
* [`cg load [PROVIDER]`](#cg-load-provider)
* [`cg policy [PROVIDER]`](#cg-policy-provider)
* [`cg policy add [PROVIDER]`](#cg-policy-add-provider)
* [`cg policy install [PROVIDER]`](#cg-policy-install-provider)
* [`cg policy list [PROVIDER]`](#cg-policy-list-provider)
* [`cg policy remove [PROVIDER]`](#cg-policy-remove-provider)
* [`cg policy update [PROVIDER]`](#cg-policy-update-provider)
* [`cg provider [PROVIDER]`](#cg-provider-provider)
* [`cg provider add [PROVIDER]`](#cg-provider-add-provider)
* [`cg provider install [PROVIDER]`](#cg-provider-install-provider)
* [`cg provider list [PROVIDER]`](#cg-provider-list-provider)
* [`cg provider remove [PROVIDER]`](#cg-provider-remove-provider)
* [`cg provider update [PROVIDER]`](#cg-provider-update-provider)
* [`cg scan [PROVIDER]`](#cg-scan-provider)
* [`cg serve [PROVIDER]`](#cg-serve-provider)
* [`cg teardown [PROVIDER]`](#cg-teardown-provider)
* [`cg update [PROVIDER]`](#cg-update-provider)

## `cg help [COMMAND]`

Display help for cg.

```
USAGE
  $ cg help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for cg.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.11/src/commands/help.ts)_

## `cg init [PROVIDER]`

Set initial configuration for providers

```
USAGE
  $ cg init [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>] [-r]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -r, --resources
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Set initial configuration for providers

EXAMPLES
  $ cg init

  $ cg init aws [Initialize AWS provider]

  $ cg init aws -r [Specify resources to crawl]
```

_See code: [src/commands/init.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/init.ts)_

## `cg launch [PROVIDER]`

Launch an instance of Dgraph to store data

```
USAGE
  $ cg launch [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Launch an instance of Dgraph to store data

EXAMPLES
  $ cg launch
```

_See code: [src/commands/launch.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/launch.ts)_

## `cg load [PROVIDER]`

Load a specific version of your CloudGraph data

```
USAGE
  $ cg load [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Load a specific version of your CloudGraph data

EXAMPLES
  $ cg load [Load data for all providers configured]

  $ cg load aws [Load data for AWS]
```

_See code: [src/commands/load.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/load.ts)_

## `cg policy [PROVIDER]`

Commands to manage policy pack modules, run $ cg policy for more info.

```
USAGE
  $ cg policy [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Commands to manage policy pack modules, run $ cg policy for more info.
```

_See code: [src/commands/policy/index.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/policy/index.ts)_

## `cg policy add [PROVIDER]`

Add new policy packs

```
USAGE
  $ cg policy add [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Add new policy packs

ALIASES
  $ cg add policy

EXAMPLES
  $ cg policy add aws-cis-1.2.0

  $ cg policy add aws-cis-1.2.0@0.12.0
```

## `cg policy install [PROVIDER]`

Install policy packs based on the lock file

```
USAGE
  $ cg policy install [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Install policy packs based on the lock file

ALIASES
  $ cg install policy

EXAMPLES
  $ cg policy install
```

## `cg policy list [PROVIDER]`

List currently installed policy packs and versions

```
USAGE
  $ cg policy list [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  List currently installed policy packs and versions

ALIASES
  $ cg ls policy
  $ cg list policy

EXAMPLES
  $ cg policy list

  $ cg policy list aws
```

## `cg policy remove [PROVIDER]`

Remove currently installed policy pack

```
USAGE
  $ cg policy remove [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Remove currently installed policy pack

ALIASES
  $ cg remove policy
  $ cg policy remove
  $ cg policy rm
  $ cg del policy
  $ cg rm policy

EXAMPLES
  $ cg policy delete

  $ cg policy delete aws-cis-1.2.0

  $ cg policy delete aws-cis-1.2.0 --no-save
```

## `cg policy update [PROVIDER]`

Update currently installed policy packs

```
USAGE
  $ cg policy update [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Update currently installed policy packs

EXAMPLES
  $ cg policy update

  $ cg policy update aws-cis-1.2.0

  $ cg policy update aws-cis-1.2.0@0.12.0
```

## `cg provider [PROVIDER]`

Commands to manage provider modules, run $ cg provider for more info.

```
USAGE
  $ cg provider [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Commands to manage provider modules, run $ cg provider for more info.
```

_See code: [src/commands/provider/index.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/provider/index.ts)_

## `cg provider add [PROVIDER]`

Add new providers

```
USAGE
  $ cg provider add [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Add new providers

ALIASES
  $ cg add provider

EXAMPLES
  $ cg provider add aws

  $ cg provider add aws@0.12.0
```

## `cg provider install [PROVIDER]`

Install providers based on the lock file

```
USAGE
  $ cg provider install [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Install providers based on the lock file

ALIASES
  $ cg install provider

EXAMPLES
  $ cg provider install
```

## `cg provider list [PROVIDER]`

List currently installed providers and versions

```
USAGE
  $ cg provider list [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  List currently installed providers and versions

ALIASES
  $ cg ls provider
  $ cg list provider

EXAMPLES
  $ cg provider list

  $ cg provider list aws
```

## `cg provider remove [PROVIDER]`

Remove currently installed provider

```
USAGE
  $ cg provider remove [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Remove currently installed provider

ALIASES
  $ cg remove provider
  $ cg provider remove
  $ cg provider rm
  $ cg del provider
  $ cg rm provider

EXAMPLES
  $ cg provider delete

  $ cg provider delete aws

  $ cg provider delete aws --no-save
```

## `cg provider update [PROVIDER]`

Update currently installed providers

```
USAGE
  $ cg provider update [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Update currently installed providers

EXAMPLES
  $ cg provider update

  $ cg provider update aws

  $ cg provider update aws@0.12.0
```

## `cg scan [PROVIDER]`

Scan one or multiple providers data to be queried through Dgraph

```
USAGE
  $ cg scan [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Scan one or multiple providers data to be queried through Dgraph

EXAMPLES
  $ cg scan

  $ cg scan aws

  $ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]

  $ cg scan aws --no-serve [Do not start the query engine]
```

_See code: [src/commands/scan.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/scan.ts)_

## `cg serve [PROVIDER]`

Serve a GraphQL query tool to query your CloudGraph data.

```
USAGE
  $ cg serve [PROVIDER] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p <value>]
    [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Serve a GraphQL query tool to query your CloudGraph data.

EXAMPLES
  $ cg serve
```

_See code: [src/commands/serve.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/serve.ts)_

## `cg teardown [PROVIDER]`

Stops the Dgraph Docker container.

```
USAGE
  $ cg teardown [PROVIDER] [--delete-image]

FLAGS
  --delete-image  Remove dgraph docker image after stopping it

DESCRIPTION
  Stops the Dgraph Docker container.

EXAMPLES
  $ cg teardown

  $ cg teardown --delete-image
```

_See code: [src/commands/teardown.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/teardown.ts)_

## `cg update [PROVIDER]`

Upgrade currently installed plugins.

```
USAGE
  $ cg update [PROVIDER] [--no-save] [--dev] [-d <value>] [-s dgraph] [--directory <value>] [--no-serve] [-p
    <value>] [-q playground|altair] [-l <value>] [--use-roles] [-P <value>]

FLAGS
  -P, --policies=<value>       Policy Packs to execute during scan
  -d, --dgraph=<value>         Set where dgraph is running (default localhost:8997)
  -l, --version-limit=<value>  Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=<value>           Set port to serve query engine
  -q, --query-engine=<option>  Query engine to launch
                               <options: playground|altair>
  -s, --storage=<option>       Select a storage engine to use. Currently only supports Dgraph
                               <options: dgraph>
  --dev                        Turn on developer mode
  --directory=<value>          Set the folder where CloudGraph will store data. (default cg)
  --no-save                    Set to not alter lock file, just delete plugin
  --no-serve                   Set to not serve a query engine
  --use-roles                  Set to true to use roleARNs instead of profiles for AWS credentials

DESCRIPTION
  Upgrade currently installed plugins.

ALIASES
  $ cg update

EXAMPLES
  $ cg update
```

_See code: [src/commands/update.ts](https://github.com/cloudgraphdev/cli/blob/0.20.8/src/commands/update.ts)_
<!-- commandsstop -->
