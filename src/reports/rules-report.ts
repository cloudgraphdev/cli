import Table from 'cli-table'
import chalk from 'chalk'
import CloudGraph from '@cloudgraph/sdk'

const { logger } = CloudGraph

export enum scanResult {
  pass = 'pass',
  fail = 'fail',
  warn = 'warn'
}

export enum scanDataType {
  status = 'status',
  count = 'count'
}

export class RulesReport {
  constructor() {
    this.table = new Table({ head: this.tableHeaders })
  }

  tableHeaders = [
    chalk.green('ResourceId'),
    chalk.green('Result'),
  ]

  table: Table

  pushData({ resourceId, result }: { resourceId: string, result: 'FAIL' | 'PASS' | 'MISSING' }): void {

    const status = this.getStatus(result)

    this.table.push([resourceId, status])
  }



  private getStatus(result: string): string {
    let status
    switch (result) {
      case 'MISSING': {
        status = chalk.yellow(
          String.fromCodePoint(0x26A0) // warning symbol
        )
        break
      }
      case 'FAIL': {
        status = chalk.red(
          String.fromCodePoint(0x1F6AB) // failure symbol
        )
        break
      }
      default: {
        status = chalk.green(String.fromCodePoint(0x2714)) // checkmark symbol
      }
    }
    return status
  }

  print(ruleDescription: string): void {
    logger.info(`Printing results for ${chalk.italic.green(ruleDescription)} rule...`)

    console.log(this.table.toString())
  }

  clean(): void {
    this.table = new Table({ head: this.tableHeaders })
  }

}

export default new RulesReport()
