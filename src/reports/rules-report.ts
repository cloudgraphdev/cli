import Table from 'cli-table'
import chalk from 'chalk'
import CloudGraph from '@cloudgraph/sdk'
import { isEmpty } from 'lodash'

const { logger } = CloudGraph

export class RulesReport {
  tableHeaders = [chalk.green('ResourceId'), chalk.green('Result')]

  tables: { [policyPack: string]: Table } = {}

  pushData({
    policyPack,
    resourceId,
    ruleDescription,
    result,
  }: {
    policyPack: string
    resourceId: string
    ruleDescription: string
    result: 'FAIL' | 'PASS' | 'MISSING'
  }): void {
    const status = this.getStatus(result)

    if (!this.tables[policyPack]) {
      this.tables[policyPack] = new Table({ style: { head: [], border: [] } })
      this.tables[policyPack].push(
        [chalk.italic.green(ruleDescription)],
        this.tableHeaders
      )
    }

    this.tables[policyPack].push([resourceId, status])
  }

  private getStatus(result: string): string {
    let status
    switch (result) {
      case 'MISSING': {
        status = chalk.yellow(
          String.fromCodePoint(0x26a0) // warning symbol
        )
        break
      }
      case 'FAIL': {
        status = chalk.red(
          String.fromCodePoint(0x1f6ab) // failure symbol
        )
        break
      }
      default: {
        status = chalk.green(String.fromCodePoint(0x2714)) // checkmark symbol
      }
    }
    return status
  }

  print(): void {
    if (!isEmpty(this.tables)) {
      logger.info('Printing rules result...')

      for (const tableName in this.tables) {
        if (tableName) {
          console.log(this.tables[tableName].toString())
        }
      }
    }
  }
}

export default new RulesReport()
