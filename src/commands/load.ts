/* eslint-disable no-console */
import {flags} from '@oclif/command'
import axios from 'axios'
import {getKeyByValue, getLatestProviderData} from '../utils'
import {cosmiconfigSync} from 'cosmiconfig'
import manager from '../manager'
import {Opts} from 'cloud-graph-sdk'

import Command from './base'
import {fileUtils} from '../utils'

// const readline = require('readline')
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const ora = require('ora')

export default class Load extends Command {
  static description = 'Scan provider data based on your config';

  static examples = [
    `$ cloud-graph scan aws
Lets scan your AWS resources!
`,
  ];

  static strict = false;

  static flags = Command.flags

  static args = Command.args

  async run() {
    const {argv, flags: {debug, dev: devMode}} = this.parse(Load)
    const opts: Opts = {logger: this.logger, debug, devMode}
    // this.exit()
    // const provider = args.provider
    let allProviers = argv
    this.logger.log(allProviers)
    // if (!provider) {
    //   provider = await this.getProvider()
    // }

    /**
     * Handle 2 methods of scanning, either for explicitly passed providers OR
     * try to scan for all providers found within the config file
     * if we still have 0 providers, fail and exit.
     */
    if (allProviers.length >= 1) {
      this.logger.log(`Loading data to Dgraph for providers: ${allProviers}`)
    } else {
      this.logger.log('Loading data to Dgraph for providers found in config')
      const configSearcher = cosmiconfigSync('cloud-graph')
      const config = configSearcher.search()
      allProviers = Object.keys(config?.config)
      if (allProviers.length === 0) {
        this.logger.log(
          'Error, there are no providers configured and none were passed to load, have you run the INIT command yet?'
        )
        this.exit()
      }
    }

    /**
     * loop through providers and attempt to scan each of them
     */
    let schema: any[] = []
    const promises: Promise<any>[] = []
    for (const provider of allProviers) {
      this.logger.log(`Beginning LOAD for ${provider}`)
      const plugin = await this.getProviderPlugin(provider, opts)
      if (!plugin) {
        continue
      }
      // console.log(config)
      const {
        serviceFactory,
        getGraphqlSchema,
        enums,
      } = plugin

      // const creds: any = await getProviderCredentials(opts)
      // const {accountId} = await getProviderIdentity({credentials: creds, opts})
      // this.logger.log(providerConfig)
      // const providerData = await getProviderData({
      //   regions: providerConfig.regions,
      //   resources: providerConfig.resources,
      //   credentials: creds,
      //   opts,
      // })
      // console.log(providerData)
      const providerSchema: any[] = getGraphqlSchema(opts)
      schema = [...schema, ...providerSchema]
      fileUtils.writeGraphqlSchemaToFile(providerSchema, provider)
      /**
       * Grab all AWS SDK data for the requested regions/resources
       */
      // const awsSdkData = await getDataFromAwsSdk({regions: 'us-east-1', resources: '', credentials: creds, forceFetchAsgs: false, additionalResources: 'ec2_instance,alb,route53'})
      // console.log(JSON.stringify(awsSdkData))
      // eslint-disable-next-line no-console
      // step 1 grab the data with awsSdkData
      // step 2 format the data for flat file (enterprise: needs to also format for sumerian ui data => this is used to make more connections between data)
      // step 2.1 we need to really understand what the best way to format the data for OS and enterprise
      // step 3 enterprise => how do we flip back and forth between dgraph and 3d ENV
      // do we need to flip from 3d to dgraph?
      // converters: new flat data shape, from flat data to dgraph converter. from flat data to 3d converter. dgraph to 3d converter as well.
      // We need to know the schema, flat file needs entites AND all the connections
      // get all the data, make all the connection between data, format data for flat file
      // take the connections and build relations
      // graphql needs this at compile time ^
      // we have kmsRawData (what comes from the sdk and possible gets type from here) KmsKey
      // is there a good valid reason to have "middle layer". other option is take raw data, build connections from that in another data obj, formats the non-connection keys from the type, make connections to build our schema types (KMSKey)

      /**
       * Combine all sub graphql schemas into one
       */
      // const typesArray = loadFilesSync(path.join(__dirname, '../../../../api/services'), {recursive: true, extensions: ['graphql']})

      /**
       * Write combined schema to file and then update dgraph to serve combined schema
       */
      // fs.writeFileSync(path.join(__dirname, '../../schema.graphql'), schema)
      // const ret = await axios({
      //   url: 'http://localhost:8080/admin',
      //   method: 'post',
      //   data: {
      //     query: `mutation($schema: String!) {
      //       updateGQLSchema(input: { set: { schema: $schema } }) {
      //         gqlSchema {
      //           schema
      //         }
      //       }
      //     }
      //     `,
      //     variables: {
      //       schema: schema,
      //     },
      //   },
      // })
      // console.log(JSON.stringify(ret.data))
      this.logger.log('GETTING LATEST PROVIDER DATA')
      const allTagData: any[] = []
      let files
      try {
        files = getLatestProviderData(provider)
      } catch (error: any) {
        this.logger.log(`Unable to find saved data for ${provider}, run SCAN to fetch new data for ${provider}`, {level: 'error'})
        this.exit()
      }
      let file
      if (files.length > 1) {
        const answer = await this.interface.prompt([
          {
            type: 'checkbox',
            message: 'Select scan version to load',
            loop: false,
            name: 'file',
            choices: files.map(({name: file}: {name: string}) => fileUtils.mapFileNameToHumanReadable(file)),
          },
        ])
        this.logger.log(answer)
        file = fileUtils.mapFileSelectionToLocation(answer.file[0])
        this.logger.log(file)
      } else {
        file = files[0].name
      }
      const result = JSON.parse(fs.readFileSync(file, 'utf8'))
      console.log(result)
      /**
       * Loop through the aws sdk data to format entities and build connections
       * 1. Format data with provider service format function
       * 2. build connections for data with provider service connections function
       * 3. spread new connections over result.connections
       * 4. push the array of formatted entities into result.entites
       */
      /**
       * Loop through the result entities and for each entity:
       * Look in result.connections for [key = entity.arn]
       * Loop through the connections for entity and determine its resource type
       * Find entity in result.entites that matches the id found in connections
       * Build connectedEntity by pushing the matched entity into the field corresponding to that entity (alb.ec2Instance => [ec2Instance])
       * Push connected entity into dgraph
       */
      for (const entity of result.entities) {
        const {name, data} = entity
        const {mutation} = serviceFactory(name)
        const connectedData = data.map((service: any) => {
          console.log(`connecting service: ${name}`)
          console.log(`service id is: ${service.id}`)
          const connections = result.connections[service.id]
          const connectedEntity = {
            ...service,
          }
          if (connections) {
            for (const connection of connections) {
              console.log(
                `searching for ${connection.resourceType} entity data to make connection between ${name} && ${connection.resourceType}`
              )
              const entityData = result.entities.find(
                ({name}: {name: string}) => name === connection.resourceType
              )
              if (entityData && entityData.data) {
                // console.log('found entities for connection')
                // console.log(entityData)
                const entityForConnection = entityData.data.find(
                  ({id}: { id: string }) => connection.id === id
                )
                // console.log('found connection entity')
                // console.log(entityForConnection)
                connectedEntity[connection.field] = entityForConnection
                // console.log(connectedEntity)
              }
            }
          }
          return connectedEntity
        })
        console.log(connectedData)
        // const reqPromise = axios({
        //   url: 'http://localhost:8080/graphql',
        //   method: 'post',
        //   data: {
        //     query: mutation,
        //     variables: {
        //       input: connectedData,
        //     },
        //   },
        // }).then(res => {
        //   console.log('AXIOS RESPONSE')
        //   console.log(JSON.stringify(res.data))
        // })
        // promises.push(reqPromise)
      }
      // await Promise.all(promises)
    }
    fileUtils.writeGraphqlSchemaToFile(schema)
    // const ret = await axios({
    //   url: 'http://localhost:8080/admin',
    //   method: 'post',
    //   data: {
    //     query: `mutation($schema: String!) {
    //         updateGQLSchema(input: { set: { schema: $schema } }) {
    //           gqlSchema {
    //             schema
    //           }
    //         }
    //       }
    //       `,
    //     variables: {
    //       schema: schema,
    //     },
    //   },
    // })
    // console.log(ret)
    await Promise.all(promises)
    // TODO: what to do after loading data and before exiting? show url or something?
    this.exit()
    // console.log(JSON.stringify(result.connections))
    // console.log(JSON.stringify(res.data))
  }
}
