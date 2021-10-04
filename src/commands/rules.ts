import Command from './base'
import { processConnectionsBetweenEntities } from '../utils'
import DgraphEngine from '../storage/dgraph'
import RulesProvider from "../policyPacks/rules-provider";
import {mergeTypeDefs} from "@graphql-tools/merge";
import {print} from "graphql";

function mergeSchemas(currSchema: string, additions: string[]) {
  const s = mergeTypeDefs([currSchema, ...additions]);
  return print(s)
}

export default class Rules extends Command {
  static description = 'Local test'

  static examples = [
    '$ cg rules',
  ]

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  async run() {
    const {
      flags: { dev: devMode },
    } = this.parse(Rules)
    // Run dgraph health check
    const storageEngine = this.getStorageEngine()
    const storageRunning = await storageEngine.healthCheck()

    const client = new RulesProvider(); // await this.getProviderClient(provider)

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
    const currSchema: string = await dGraph.getSchema()
    const providerSchema: string[] = client.getSchema()
    await storageEngine.setSchema([mergeSchemas(currSchema, providerSchema)])

    /**
     * Run rules:
     * @NOTE: This should be run once, but it's ~almost idempotent. The mutations are 'upserts' but
     * we'd not be covering things such as 'deletes'. It's useful for local development, but lets try to run them once per version
     * same interface as Providers, but we pass dGraph client - previous data needs to be saved already
     */
    const providerData = await client.getData(dGraph)

    // @NOTE: processConnectionsBetweenEntities is not needed as we can return the right mutations from within the rules plugin
    // we only use it as it has the report, and to push the mutations
    processConnectionsBetweenEntities(
      providerData,
      storageEngine,
      storageRunning
    )
    await storageEngine.run(false)
    this.exit()
  }
}
