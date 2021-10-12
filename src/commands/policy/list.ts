// import { isEmpty, pickBy } from 'lodash'
// import chalk from 'chalk'
import Command from '../base'

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
    // const { argv } = this.parse(List)
    // const allProviders = argv
    // const manager = this.getPluginManager()
    // const lockFile = manager.getLockFile()
    // if (isEmpty(lockFile)) {
    //   this.logger.info('No providers found, have you installed any?')
    //   this.exit()
    // }
    // const providersToList = allProviders.length >= 1 ? pickBy(lockFile, (_, key) => {
    //   return allProviders.includes(key)
    // }) : lockFile
    // for (const [key, value] of Object.entries(providersToList)) {
    //   this.logger.success(`Provider ${chalk.green(`${key}@${value}`)} is installed`)
    // }
  }
}
