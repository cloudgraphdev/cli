import { PluginType } from '@cloudgraph/sdk'
import { isEmpty, pickBy } from 'lodash'
import chalk from 'chalk'
import Command from '../base'

const getPolicy = (val: string): string =>
  val.includes('@') ? val.split('@')[0] : val

export default class Update extends Command {
  static description = 'Update currently installed policy packs'

  static examples = [
    '$ cg policy update',
    '$ cg policy update aws-cis-1.2.0',
    '$cg policy update aws-cis-1.2.0@0.12.0',
  ]

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(Update)
    const allPolicyPacks = argv
    const manager = this.getPluginManager(PluginType.PolicyPack)
    const lockFile = manager.getLockFile()

    if (isEmpty(lockFile?.policyPack)) {
      this.logger.info(
        'No policy packs found in lock file, have you added any?'
      )
      this.exit()
    }
    // Get the policiess from the lock file that user wants to update
    // If user passes something like aws@1.1.0, filter the lock file to only grab 'aws' entry
    const policyPacksList =
      allPolicyPacks.length >= 1
        ? pickBy(lockFile, (_, key) => {
            const policiess = allPolicyPacks.map(val => {
              return getPolicy(val)
            })
            return policiess.indexOf(key) > -1
          })
        : lockFile.policyPack || {}

    // Warn the user if they are trying to update policies they have not installed.
    const nonInstalledPoliciess = allPolicyPacks.filter(rawPolicy => {
      const policy = getPolicy(rawPolicy)
      return Object.keys(lockFile).includes(policy)
    })
    for (const policyPackName of nonInstalledPoliciess) {
      this.logger.warn(
        `${chalk.green(
          getPolicy(policyPackName)
        )} not found in lock file, have you installed it?`
      )
    }

    // Loop through policies and try to update them
    for (const [key] of Object.entries(policyPacksList)) {
      let version = 'latest'
      const rawP = allPolicyPacks.find(val => val.includes(key))
      if (rawP && rawP.includes('@')) {
        [, version] = rawP.split('@')
      }
      await manager.getPlugin(key, version)
    }
  }
}
