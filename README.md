<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/logo.png">
    <img alt="CloudGraph" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/logo.png" width="75%" style="display: block; margin: auto" />
  </a>
</p>

<br />
<br />

An instant **GraphQL** API to query your cloud infrastructure and configuration so that you can solve a host of complex security, compliance, and governance challenges **10x faster**. Built and maintained with love by the team at ❤️ [AutoCloud](https://www.autocloud.dev/) ❤️

<br />

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@cloudgraph/cli.svg)](https://npmjs.org/package/@cloudgraph/cli)
[![License](https://img.shields.io/npm/l/@cloudgraph/cli.svg)](https://github.com/cloudgraphdev/cli/blob/master/package.json)

<!-- toc -->
* [Why CloudGraph](#why-cloudgraph)
* [How It Works](#how-it-works)
* [Authentication](#authentication)
* [Install](#install)
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

# Why CloudGraph

Whether you're a cloud architect with 15 years of experience or someone who is just getting started on their cloud journey, there is no denying that staying on top of security, compliance, governance, FinOps, operations...etc., is challenging, time-consuming work. Even answering basic questions like, "What all is running in the us-east-1 region?", "Are my RDS clusters properly secured and compliant?", or "How much is this EKS/AKS/GKE cluster going to cost me this month?" requires both time and expertise, or expensive 3rd party software.


<br />

**Not anymore.**

<br />

CloudGraph lets any cloud professional answer questions like, "What KMS keys do I have in us-west-2?", "How much am I paying for my environment?", and, "What resources in my production environment aren’t tagged correctly?" in the time it takes to put on the pants you should already be wearing for your next zoom meeting. Ask any question about your cloud environments, and get back answers instantly in a single place with a single standardized API, for all of your cloud providers.

# How It Works

Note that CloudGraph requires **READ ONLY** permissions to run and as such can **never** mutate your actual cloud infrastructure. Additionally, none of your cloud environment information is ever sent to or shared with CloudGraph, AutoCloud, or any other third parties.

<br />

Under the hood, CloudGraph reaches out to your cloud provider(s), sucks up all of the configuration data, processes it, and stores a copy of this data for you in [Dgraph](https://dgraph.io/). It then exposes an endpoint at `http://localhost:8997` that allows you to write GraphQL Queries against your stored data. These queries not only allow you do to anything that you would do with say, the AWS SDK/CLI, but they also allow you to run much more powerful queries as well. CloudGraph ships with pre-packaged GraphQL query tools including [GraphQL Playground](https://github.com/graphql/graphql-playground) and [Altair](https://github.com/altair-viz/altair) but you can also feel free to use your own. It also includes a schema visualization tool called [Voyager](https://github.com/APIs-guru/graphql-voyager) so you can understand relationships between entities.

<br />

# Authentication

CloudGraph currently supports AWS with Azure/GCP (and several others) coming soon. For more information on generating the necessary permission for each cloud provider please view our current provider repos:

<br />

#### [AWS Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-aws)

AWS TLDR; For AWS need you an IAM User with the AWS Managed "ReadOnlyAccess" policy attached. CloudGraph will check to see what AWS user you are using in your current terminal session and use those credentials.

<br />

# Install

Use this command to install and update CloudGraph to the latest version.

<!-- install -->

```bash
npm install -g @cloudgraph/cli
```

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
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/init.png">
    <img alt="init" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/init.png" width="95%" style="display: block; margin: auto"/>
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
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/launch.png">
    <img alt="launch" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/launch.png" width="95%" style="display: block; margin: auto"/>
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

3. Scan for cloud infrastructure for all configured providers. This command will reach out and read all of the metadata on your cloud infrastructure. Note that it is **completely normal** to see warnings and errors while the `cg scan` command runs, these are usually caused by permissions issues. That said, if you encounter any problematic errors running CloudGraph you can prepend `CG_DEBUG=5` to the beginning of your command as in, `CG_DEBUG=5 cg scan`. This will print out the verbose logs with more information that you can then use to either open an [issue on GitHub](https://github.com/cloudgraphdev/cli/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) or let us know in our [Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-vb8whl6u-3YH0F4mHXNyC6SOqZJvClQ).

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/scan.png">
    <img alt="scan" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/scan.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

That's it, you are all set to start querying! The query tool you selected during the `cg init` command will then be opened in your preferred browser to run queries, mutations, and visualizations on all of your cloud infrastructure!

<br/>

Note that you may also use **any** GraphQL query tool you would like by connecting it to http://localhost:8997/graphql.

<!-- quickstartstop -->

<br />

# Loading Previous Versions

<br />

CloudGraph stores as many previous versions of your data as you configured in the `cg init` command. In order to load and query a previous version of your data simply run the `cg load` command and select the version of your data you wish to inspect like so:

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/load.png">
    <img alt="load" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/load.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

# Supported Services

<br />

### AWS

For a list of currently supported AWS services please see the [AWS Provider Repo](https://github.com/cloudgraphdev/cloudgraph-provider-aws)

<br />

<!-- examplesqueries -->

# Example Queries

To use CloudGraph, you will need to be familiar with [GraphQL](https://graphql.org/). This section contains a handful of example queries to get you up and running but is by no means exhaustive. If you can dream it up, you can query it! Note that you can find additional example queries in the [examples](https://github.com/cloudgraphdev/cli/tree/master/examples) directory. Feel free to make a PR with other examples you would like to see included, check out the [Contribution Guidelines](#contribution-guidelines) section for more information.

<br />

## Basic AWS Query Syntax Examples:

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
    },
  },
  "extensions": {
    "touched_uids": 4
  }
}
```

<br />

Get the `ID` and `ARN` of each `EC2` in all the AWS accounts you have scanned:

```graphql
query {
  queryawsEc2 {
    id
    arn
  }
}
```

<br />

Get the `ID` and `ARN` of all `EC2` instances in one of your AWS accounts by filtering the accountId:

```graphql
query {
  queryawsEc2(filter: { accountId: { eq: '123456' } }) {
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
      ec2Instance{
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
      kms {id
      arn}
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

<br />

Find all the unencrypted `EBS Volumes`:

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
    filter: {  key: { eq: "Environment" }, value: { eq: "Production" } }
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

Note that in order to successfully ingest FinOps related data you must have the Cost Explorer API enabled in your AWS Account. [You can view how to do that here](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ce-access.html)

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
    dailyCost
    currency
    formattedDailyCost
  }
}
```

<br />

This query will return a `JSON` payload that looks like this. All of the following examples will follow suit:

```json
{
  "data": {
  "queryawsEc2": [
    {
      "arn": "arn:aws:ec2:us-east-1:111122222333:instance/i-03jdfgakfg9999fgf",
      "dailyCost": 2.06,
      "currency": "USD",
      "formattedDailyCost": "$2.06"
    },
    {
      "arn": "arn:aws:ec2:us-east-1:111122222333:instance/i-jifgfd0df0gdf8fd88",
      "dailyCost": 34.11,
      "currency": "USD",
      "formattedDailyCost": "$34.11"
    }
    ...More EC2 Instances
  ],
  "extensions": {
    "touched_uids": 212
  }
}
```

<br />

Get each `NAT Gateway` in your AWS account along with its daily cost:

```graphql
query {
  queryawsNatGateway {
    arn
    currency
    dailyCost
    formattedDailyCost
  }
}
```

<br />

## Thinking in terms of a graph:

<br />

When you think, "in terms of a graph", you can do almost anything with CloudGraph. Say for example that you want to know what Lamba functions don't belong to a VPC (i.e. they don't leverage VPC networking). Because CloudGraph connects all resources that have relationships, such as VPC parents to their Lambda children, you are able to answer this question easily. Simply check to see what lambda functions the VPC is "connected" to, and compare that against the list of all lambda functions like so:


```graphql
query {
  queryawsVpc{
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
  queryawsEc2(filter: { ebs: { isBootDisk: true } }) {
    id
    arn
    ebs {
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
    <img alt="gqlPlayground" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlPlayground.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

## [Altair](https://github.com/altair-graphql/altair)

Altair is another great GraphQL query tool that packs a ton of [features](https://github.com/altair-graphql/altair#features) for power users. Do things like autocomplete queries, dynamically add fragments, and export/import collections of queries. To access Altair, either select it as your preferred query tool in the `init` command OR visit `/altair` in the server CG spins up.

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlAltair.png">
    <img alt="gqlAltair" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/gqlAltair.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<br />

## [Voyager](https://github.com/APIs-guru/graphql-voyager)

GraphQL Voyager is an awesome way to explore the schema(s) for your CG providers. It gives you a great bidirectional chart containing all your types and queries. You can click entities or arrows to discover connections, search for something specific, and get a deeper understanding of your schema. To access voyager, visit `/voyager` in the server CG spins up.

<br />

<p align="center">
  <a href="https://github.com/cloudgraphdev/cli/raw/master/docs/images/voyager.png">
    <img alt="voyager" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/voyager.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

<!-- querytoolsstop -->

<br />

# Community

<br />

Comments, questions, or feedback? Please [Join Our Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-vb8whl6u-3YH0F4mHXNyC6SOqZJvClQ) we would love to hear from you.

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
    <img alt="autocloud" src="https://github.com/cloudgraphdev/cli/raw/master/docs/images/autoCloud.png" width="95%" style="display: block; margin: auto"/>
  </a>
</p>

# Debugging

If you encounter any errors running CloudGraph you can prepend `CG_DEBUG=5` to the beginning of your command as in, `CG_DEBUG=5 cg scan`. This will print out the verbose logs with more information that you can then use to either open an [issue on GitHub](https://github.com/cloudgraphdev/cli/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) or let us know in our [Slack Workspace](https://join.slack.com/t/cloudgraph-workspace/shared_invite/zt-vb8whl6u-3YH0F4mHXNyC6SOqZJvClQ).

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
* [`cg provider [PROVIDER]`](#cg-provider-provider)
* [`cg provider:add [PROVIDER]`](#cg-provideradd-provider)
* [`cg provider:install [PROVIDER]`](#cg-providerinstall-provider)
* [`cg provider:list [PROVIDER]`](#cg-providerlist-provider)
* [`cg provider:remove [PROVIDER]`](#cg-providerremove-provider)
* [`cg provider:update [PROVIDER]`](#cg-providerupdate-provider)
* [`cg scan [PROVIDER]`](#cg-scan-provider)
* [`cg serve [PROVIDER]`](#cg-serve-provider)

## `cg help [COMMAND]`

display help for cg

```
USAGE
  $ cg help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `cg init [PROVIDER]`

Set initial configuration for providers

```
USAGE
  $ cg init [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -r, --resources
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

EXAMPLES
  $ cg init
  $ cg init aws [Initialize AWS provider]
  $ cg init aws -r [Specify resources to crawl]
```

_See code: [src/commands/init.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/init.ts)_

## `cg launch [PROVIDER]`

Launch an instance of Dgraph to store data

```
USAGE
  $ cg launch [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

EXAMPLE
  $ cg launch
```

_See code: [src/commands/launch.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/launch.ts)_

## `cg load [PROVIDER]`

Load a specific version of your CloudGraph data

```
USAGE
  $ cg load [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

EXAMPLES
  $ cg load [Load data for all providers configured]
  $ cg load aws [Load data for AWS]
```

_See code: [src/commands/load.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/load.ts)_

## `cg provider [PROVIDER]`

Commands to manage provider modules, run $ cg provider for more info.

```
USAGE
  $ cg provider [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine
```

_See code: [src/commands/provider/index.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/index.ts)_

## `cg provider:add [PROVIDER]`

Add new providers

```
USAGE
  $ cg provider add [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

ALIASES
  $ cg add

EXAMPLES
  $ cg provider add aws
  $ cg provider add aws@0.12.0
```

_See code: [src/commands/provider/add.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/add.ts)_

## `cg provider:install [PROVIDER]`

Install providers based on the lock file

```
USAGE
  $ cg provider install [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

ALIASES
  $ cg install

EXAMPLE
  $ cg provider install
```

_See code: [src/commands/provider/install.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/install.ts)_

## `cg provider:list [PROVIDER]`

List currently installed providers and versions

```
USAGE
  $ cg provider list [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

ALIASES
  $ cg provider ls
  $ cg list
  $ cg ls

EXAMPLES
  $ cg provider list
  $ cg provider list aws
```

_See code: [src/commands/provider/list.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/list.ts)_

## `cg provider:remove [PROVIDER]`

Remove currently installed provider

```
USAGE
  $ cg provider remove [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-save                             Set to not alter lock file, just delete plugin
  --no-serve                            Set to not serve a query engine

ALIASES
  $ cg remove
  $ cg rm
  $ cg del
  $ cg provider rm
  $ cg provider del

EXAMPLES
  $ cg provider delete
  $ cg provider delete aws
  $ cg provider delete aws --no-save
```

_See code: [src/commands/provider/remove.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/remove.ts)_

## `cg provider:update [PROVIDER]`

Update currently installed providers

```
USAGE
  $ cg provider update [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

ALIASES
  $ cg update

EXAMPLES
  $ cg provider update
  $ cg provider update aws
  $cg provider update aws@0.12.0
```

_See code: [src/commands/provider/update.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/provider/update.ts)_

## `cg scan [PROVIDER]`

Scan one or multiple providers data to be queried through Dgraph

```
USAGE
  $ cg scan [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

EXAMPLES
  $ cg scan
  $ cg scan aws
  $ cg scan aws --dgraph http://localhost:1000 [Save data in dgraph running on port 1000]
  $ cg scan aws --no-serve [Do not start the query engine]
```

_See code: [src/commands/scan.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/scan.ts)_

## `cg serve [PROVIDER]`

Serve a GraphQL query tool to query your CloudGraph data.

```
USAGE
  $ cg serve [PROVIDER]

OPTIONS
  -d, --dgraph=dgraph                   Set where dgraph is running (default localhost:8997)
  -l, --version-limit=version-limit     Limit the amount of version folders stored on the filesystem (default 10)
  -p, --port=port                       Set port to serve query engine
  -q, --query-engine=playground|altair  Query engine to launch
  -s, --storage=dgraph                  Select a storage engine to use. Currently only supports Dgraph
  --dev                                 Turn on developer mode
  --directory=directory                 Set the folder where CloudGraph will store data. (default cg)
  --no-serve                            Set to not serve a query engine

EXAMPLE
  $ cg serve
```

_See code: [src/commands/serve.ts](https://github.com/cloudgraphdev/cli/blob/v0.10.2/src/commands/serve.ts)_
<!-- commandsstop -->
