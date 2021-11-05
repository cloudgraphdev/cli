import Table from 'cli-table'
import chalk from 'chalk'
import CloudGraph from '@cloudgraph/sdk'

import { scanDataType, scanResult } from '.'

const { logger } = CloudGraph

interface pushDataParams {
  service: string
  type: scanDataType
  result: scanResult
  msg?: string
}

enum statusLevel {
  warn = 'warn',
  fail = 'fail',
  pass = 'pass',
}

// used for updating status of a service
enum statusKeyWords {
  data = 'data',
  connections = 'connections',
}

const servicesToIgnore = ['tag', 'billing']

// TODO: come back and add tests once testing strategy is determined
export class ScanReport {
  constructor() {
    this.table = new Table({ head: this.tableHeaders })
  }

  tableHeaders = [
    chalk.green('Service'),
    chalk.green('Resources Found'),
    chalk.green('Status'),
  ]

  internalTable: { status: statusLevel; data: { [key: string]: string[] }[] } =
    { status: statusLevel.pass, data: [{ total: ['0', 'N/A'] }] }

  table: Table

  pushData({ service, type, result }: pushDataParams): void {
    if (servicesToIgnore.includes(service)) {
      return
    }
    const status = this.getStatus(result)
    if (this.isInTable(service)) {
      this.internalTable.data = this.internalTable.data.map(val => {
        if (Object.keys(val).includes(service)) {
          const [count, oldStatus] = val[service]

          // Handle count type of data push
          if (type === scanDataType.count) {
            const newCount: number = 1 + Number(count)
            return { [service]: [String(newCount), status] }
          }

          // Handle status, we do not want to "upgrade" from a failed or warning status to pass
          let newStatus = status
          if (oldStatus.includes(statusKeyWords.data)) {
            newStatus = oldStatus
          }
          if (
            oldStatus.includes(statusKeyWords.connections) &&
            !status.includes(statusKeyWords.data)
          ) {
            newStatus = oldStatus
          }
          return { [service]: [`${count}`, newStatus] }
        }
        // Handle parts of the table that dont need to update
        return val
      })
    } else {
      this.internalTable.data.push({
        [service]: [type === scanDataType.count ? '1' : '0', status],
      })
    }
    if (type === scanDataType.count) {
      this.incrementTotalTable()
    }
  }

  private incrementTotalTable(): void {
    const totalIndex = this.internalTable.data.findIndex(val => {
      return Object.keys(val).includes('total')
    })
    if (this.internalTable?.data?.[totalIndex]?.total) {
      const [currentCount, status] = this.internalTable.data[totalIndex].total
      const newCount = 1 + Number(currentCount)
      this.internalTable.data[totalIndex] = {
        total: [String(newCount), status],
      }
    }
  }

  private getStatus(result: string): string {
    let status
    switch (result) {
      case statusLevel.warn: {
        status = `${chalk.yellow(
          String.fromCodePoint(0x26a0) // warning symbol
        )} unable to make some connections`
        if (this.internalTable.status !== statusLevel.fail) {
          this.internalTable.status = statusLevel.warn
        }
        break
      }
      case statusLevel.fail: {
        status = `${chalk.red(
          String.fromCodePoint(0x1f6ab) // failure symbol
        )} unable to store data in Dgraph`
        this.internalTable.status = statusLevel.fail
        break
      }
      default: {
        status = chalk.green(String.fromCodePoint(0x2714)) // checkmark symbol
      }
    }
    return status
  }

  print(): void {
    logger.info('Printing scan report...')
    // flip the table to put total at the bottom
    const tableToPrint = [
      ...this.internalTable.data.slice(1),
      this.internalTable.data[0],
    ]
    this.table.push(
      ...tableToPrint.map(val => {
        const key = Object.keys(val)[0]
        const [, status] = val[key]
        /**
         * Color the service key based upon the status in the table.
         * We must do this at the end because coloring the text alters the text and we use the text
         * to find the correct object when adding to the table
         */
        let coloredKey = chalk.green(key)
        if (status?.includes('connections')) {
          coloredKey = chalk.yellow(key)
        }
        if (status?.includes('data')) {
          coloredKey = chalk.red(key)
        }
        return { [coloredKey]: val[key] }
      })
    )
    console.log(this.table.toString())
    if (this.internalTable.status !== statusLevel.pass) {
      logger[this.internalTable.status === statusLevel.fail ? 'error' : 'warn'](
        `While CG ran successfully, there were some ${
          this.internalTable.status === statusLevel.fail ? 'major' : 'minor'
        } issues formatting and inserting your data into dGraph.`
      )
      logger.info(
        'For a complete list of these errors and what they mean for you, please see https://github.com/cloudgraphdev/cli#common-errors'
      )
    }
  }

  private isInTable(service: string): boolean {
    return !!this.internalTable.data.find(val => {
      return Object.keys(val).includes(service)
    })
  }
}

export default new ScanReport()
