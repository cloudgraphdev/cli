import chalk from 'chalk'

import Command from './base'
import { processConnectionsBetweenEntities } from '../utils'
import DgraphEngine from '../storage/dgraph'
import { mergeSchemas } from '../utils/schema'
import { getPolicyPackQuestion } from '../utils/questions'

export default class Rules extends Command {
  static description = 'Local test'

  static examples = ['$ cg rules']

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  async getPolicyPack(): Promise<string> {
    // TODO: remove when we have more choices
    const choices = ['aws-demo']
    if (choices.length < 2) {
      return new Promise(resolve => resolve('aws-demo'))
    }
    const { policyPack } = await this.interface.prompt(getPolicyPackQuestion)
    this.logger.debug(policyPack)
    return policyPack
  }

  async run() {
    const { argv } = this.parse(Rules)

    // Run dgraph health check
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()

    let allPolicyPacks: string[] = argv
    if (allPolicyPacks.length === 0) {
      allPolicyPacks = [await this.getPolicyPack()]
    }
    if (allPolicyPacks.length >= 1) {
      this.logger.debug(`Executing rules for policy packs: ${allPolicyPacks}`)
    } else {
      this.logger.debug('Executing rules for policy packs found in config')
      const config = this.getCGConfig()
      allPolicyPacks = Object.keys(config).filter(
        (val: string) => val !== 'cloudGraph'
      )
      if (allPolicyPacks.length === 0) {
        this.logger.error(
          'There are no policy packs configured and none were passed to scan'
        )
        this.exit()
      }
    }

    const failedPolicyPackList: string[] = []
    for (const policyPack of allPolicyPacks) {
      this.logger.info(
        `Beginning ${chalk.italic.green('RULES')} for ${policyPack}`
      )
      const client = await this.getPolicyPackClient(policyPack)
      if (!client) {
        failedPolicyPackList.push(policyPack)
        this.logger.warn(`No valid client found for ${policyPack}, skipping...`)
        continue // eslint-disable-line no-continue
      }
      // const config = this.getCGConfig(policyPack)
      // this.logger.debug(config)
      // if (!config) {
      //   failedPolicyPackList.push(policyPack)
      //   this.logger.warn(
      //     `No configuration found for ${policyPack}, run "cg init ${policyPack}" to create one`
      //   )
      //   continue // eslint-disable-line no-continue
      // }
      this.logger.startSpinner(
        `${chalk.italic.green('EXECUTING')} rules for ${chalk.italic.green(
          policyPack
        )}`
      )

      // we need to extend our interface so we can use the generic one here
      const dGraph: DgraphEngine = storageEngine as DgraphEngine

      /**
       * Update Schema.
       * @NOTE: This should be run once, but it's idempotent
       * We need access to the currentSchema:
       *  - get from aws-provider (either as code dependency, or on the fly during scan)
       *  - get from local filesystem
       *  - get from DGraph (as we're doing here)
       *  Then the rules 'plugin' returns its 'append only' schema updates.
       *  Note that we can even create bidirectional connections with append-only
       */
      const currentSchema: string = await dGraph.getSchema()
      const providerSchema: string[] = client.getSchema()

      await storageEngine.setSchema([
        mergeSchemas(currentSchema, providerSchema),
      ])

      /**
       * Run rules:
       * @NOTE: This should be run once, but it's ~almost idempotent. The mutations are 'upserts' but
       * we'd not be covering things such as 'deletes'. It's useful for local development, but lets try to run them once per version
       * same interface as Providers, but we pass dGraph client - previous data needs to be saved already
       */
      const providerData = await client.getData(dGraph)
      await client.getData(dGraph)

      // @NOTE: processConnectionsBetweenEntities is not needed as we can return the right mutations from within the rules plugin
      // we only use it as it has the report, and to push the mutations
      processConnectionsBetweenEntities(
        providerData,
        storageEngine,
        storageRunning
      )
      await storageEngine.run(false)
    }

    this.exit()
  }
}
