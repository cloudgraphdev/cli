import { isEmpty, pickBy } from 'lodash'
import chalk from 'chalk'
import Command from '../base'
import { PluginType } from '../../utils/constants'

export default class List extends Command {
  static description = 'List currently installed policy packs and versions'

  static aliases = ['policy:ls', 'list', 'ls']

  static examples = ['$ cg policy list', '$ cg policy list aws']

  static strict = false

  static hidden = false

  static flags = {
    ...Command.flags,
  }

  static args = Command.args

  async run(): Promise<void> {
    const { argv } = this.parse(List)
    const allPolicyPacks = argv
    const manager = this.getPluginManager(PluginType.PolicyPack)
    const lockFile = manager.getLockFile()
    if (isEmpty(lockFile)) {
      this.logger.info('No policy packs found, have you installed any?')
      this.exit()
    }
    const policyPacksToList =
      allPolicyPacks.length >= 1
        ? pickBy(lockFile, (_, key) => {
            return allPolicyPacks.includes(key)
          })
        : lockFile.policyPack
    for (const [key, value] of Object.entries(policyPacksToList)) {
      this.logger.success(
        `Policy Pack ${chalk.green(`${key}@${value}`)} is installed`
      )
    }
  }
}
