import { flags } from '@oclif/command'
import { execCommand, findExistingDGraphContainerId } from '../utils'
import Command from './base'

export default class Teardown extends Command {
  static description = 'Stops the Dgraph Docker container.'

  static examples = ['$ cg teardown', '$ cg teardown --delete-image']

  static strict = false

  static hidden = false

  static flags = {
    // delete dgraph docker image after stopping it
    'delete-image': flags.boolean({
      default: false,
      description: 'Remove dgraph docker image after stopping it',
    }),
  }

  static args = Command.args

  async run(): Promise<void> {
    try {
      const {
        flags: { 'delete-image': rmContainer },
      } = this.parse(Teardown)
      let containerToRemove: undefined | string
      const runningContainerId = await findExistingDGraphContainerId('running')
      this.logger.startSpinner('Stopping Dgraph container...')
      if (runningContainerId) {
        await execCommand(`docker stop ${runningContainerId}`)
        this.logger.successSpinner(
          `Dgraph container(${runningContainerId}) stopped successfully!`
        )
        containerToRemove = runningContainerId
      } else {
        const exitedContainerId = await findExistingDGraphContainerId('exited')
        if (exitedContainerId && exitedContainerId !== '') {
          this.logger.successSpinner(
            `Existing Dgraph container(${exitedContainerId}) is already stopped!`
          )
          containerToRemove = exitedContainerId
        } else {
          this.logger.successSpinner('No Dgraph containers found!')
        }
      }
      if (rmContainer && containerToRemove) {
        this.logger.startSpinner(
          `Removing Dgraph container(${containerToRemove})...`
        )
        await execCommand(`docker rm ${containerToRemove}`)
        this.logger.successSpinner(
          `Dgraph container(${containerToRemove}) removed successfully`
        )
      }
    } catch (error: any) {
      this.logger.failSpinner('Error while stopping dgraph container')
      this.logger.debug(error)
    }
  }
}
