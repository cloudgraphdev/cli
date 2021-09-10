import Table from 'cli-table'
import chalk from 'chalk'
import CloudGraph from '@cloudgraph/sdk'

export enum scanResult {
  pass = 'pass',
  fail = 'fail',
  warn = 'warn'
}

export enum scanDataType {
  status = 'status',
  count = 'count'
}
interface pushDataParams {
  service: string
  type: scanDataType
  result: scanResult
  msg?: string
}

const { logger } = CloudGraph

enum statusLevel {
  warn = 'warn',
  fail = 'fail',
  pass = 'pass',
}

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

  internalTable: { status: number; data: { [key: string]: string[] }[] } =
    { status: -1, data: [{ total: ['0', 'N/A'] }] }

  table: Table

  pushData({ service, type, result }: pushDataParams): void {
    if (service === 'tag') {
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
          if (oldStatus.includes('data')) {
            newStatus = oldStatus
          }
          if (oldStatus.includes('connections') && !status.includes('data')) {
            newStatus = oldStatus
          }
          return { [service]: [`${count}`, newStatus] }
        }
        // Handle parts of the table that dont need to update
        return val
      })
    } else {
      this.internalTable.data.push({ [service]: ['1', status] })
    }
    if (type === scanDataType.count && service !== 'tag') {
      this.incrementTotalTable()
    }
  }

  private incrementTotalTable(): void {
    const totalIndex = this.internalTable.data.findIndex(val => {
      return Object.keys(val).includes('total')
    })
    const [currentCount, status] = this.internalTable.data[0].total
    const newCount = 1 + Number(currentCount)
    this.internalTable.data[totalIndex] = { total: [String(newCount), status] }
  }

  private getStatus(result: string): string {
    let status
    switch (result) {
      case statusLevel.warn: {
        status = `${chalk.yellow(
          String.fromCodePoint(0x26A0)
        )} unable to make some connections`
        if (this.internalTable.status !== 1) {
          this.internalTable.status = 0
        }
        break
      }
      case statusLevel.fail: {
        status = `${chalk.red(
          String.fromCodePoint(0x1F6AB)
        )} unable to store data in Dgraph`
        this.internalTable.status = 1
        break
      }
      default: {
        status = chalk.green(String.fromCodePoint(0x2714))
      }
    }
    return status
  }

  print(): void {
    logger.info('Printing scan report...')
    // flip the table to put total at the bottom
    const tableToPrint = [...this.internalTable.data.slice(1), this.internalTable.data[0]]
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
    if (this.internalTable.status > -1) {
      logger.warn(
        `While CG ran successfully, there were some ${
          this.internalTable.status === 1 ? 'major' : 'minor'
        } issues formatting and inserting your data into dGraph.`
      )
      logger.info(
        'For a complete list of these errors and what they mean for you please see our documentation'
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
