import chalk from 'chalk'
import path from 'path'
import { exec } from 'child_process'

import Command from './base'
import { sleep, fileUtils } from '../utils'
import DgraphEngine from '../storage/dgraph'

export default class Launch extends Command {
  static description = 'Launch an instance of Dgraph to store data'

  static examples = ['$ cg launch']

  static dgraphContainerLabel = 'cloudgraph-cli-dgraph-standalone'

  static strict = false

  static flags = {
    ...Command.flags,
  }

  static hidden = false

  static args = Command.args

  execCommand(cmd: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error: any, stdout: any, stderr: any) => {
        if (error) {
          reject(error)
        }
        resolve(stdout || stderr)
      })
    })
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: convert this func to handle any storage provider
  async run() {
    // const {flags: {debug, dev: devMode}} = this.parse(Launch)
    // eslint-disable-next-line no-warning-comments
    // TODO: not a huge fan of this pattern, rework how to do debug and devmode tasks (specifically how to use in providers)
    // const opts: Opts = {logger: this.logger, debug, devMode}
    this.logger.startSpinner('Checking for Docker')
    const { dataDir } = this.config
    try {
      await this.execCommand('docker -v')
      this.logger.successSpinner('Docker found')
    } catch (error: any) {
      this.logger.failSpinner(
        'It appears Docker is not installed, please install it at: https://docs.docker.com/get-docker/'
        // { level: 'error' }
      )
      this.logger.error(error)
      this.exit()
    }

    this.logger.startSpinner(
      'Checking for an existing Dgraph docker instance'
    )
    let runningContainerId
    try {
      const stdout: any = await this.execCommand(
        `docker ps --filter label=${Launch.dgraphContainerLabel} --filter status=running --quiet`
      )
      const containerId = stdout.trim()
      if (containerId) {
        runningContainerId = containerId
      }
    } catch (error: any) {
      this.logger.error(error)
    }

    let exitedContainerId
    if (!runningContainerId) {
      try {
        const stdout: any = await this.execCommand(
          `docker ps --filter label=${Launch.dgraphContainerLabel} --filter status=exited --quiet`
        )
        const containerId = stdout.trim()
        if (containerId) {
          exitedContainerId = containerId
          this.logger.successSpinner('Reusable container found!')
        }
      } catch (error: any) {
        this.logger.error(error)
      }
    }

    if (!exitedContainerId && !runningContainerId) {
      this.logger.successSpinner('No reusable instances found')
      this.logger.startSpinner(
        'pulling Dgraph Docker image'
      )
      try {
        fileUtils.makeDirIfNotExists(path.join(dataDir, '/dgraph'))
        await this.execCommand('docker pull dgraph/standalone')
        this.logger.successSpinner('Pulled Dgraph Docker image')
      } catch (error: any) {
        this.logger.failSpinner(
          'Failed pulling Dgraph Docker image please check your docker installation'
          // { level: 'error' }
        )
        this.logger.error(error)
      }
    }

    if (runningContainerId) {
      this.logger.successSpinner('Reusable container found')
    } else {
      this.logger.startSpinner(
        `Spinning up ${exitedContainerId ? 'existing' : 'new'} Dgraph instance`
      )
      try {
        if (exitedContainerId) {
          await this.execCommand(`docker container start ${exitedContainerId}`)
        } else {
          await this.execCommand(
            `docker run -d -p 8995:5080 -p 8996:6080 -p 8997:8080 -p 8998:9080 -p 8999:8000 --label
            ${Launch.dgraphContainerLabel} -v ${dataDir}/dgraph:/dgraph --name dgraph dgraph/standalone:v21.03.1`
          )
        }
        this.logger.successSpinner('Dgraph instance running')
      } catch (error: any) {
        this.logger.failSpinner('Failed starting Dgraph instance')
        this.logger.error(error)
        throw new Error('Dgraph was unable to start')
      }
    }

    await this.checkIfInstanceIsRunningReportStatus()
  }

  async checkIfInstanceIsRunningReportStatus(): Promise<void> {
    this.logger.startSpinner(
      'Running health check on Dgraph'
    )
    // eslint-disable-next-line no-warning-comments
    // TODO: smaller sleep time and exponential backoff for ~5 tries
    await sleep(10000)
    try {
      const storageEngine = this.getStorageEngine()
      const running = await storageEngine.healthCheck(false)
      if (running) {
        this.logger.successSpinner('Dgraph health check passed')
      } else {
        throw new Error('Dgraph was unable to start')
      }
    } catch (error: any) {
      this.logger.debug(error)
      throw new Error('Dgraph was unable to start')
    }
    this.logger.success(
      `Access your dgraph instance at ${chalk.underline.green(
        this.getHost((this.getStorageEngine() as DgraphEngine).connectionConfig)
      )}`
    )
    this.logger.info(
      `For more information on dgraph, see the dgrah docs at: ${chalk.underline.green(
        'https://dgraph.io/docs/graphql/'
      )}`
    )
    this.exit()
  }
}
