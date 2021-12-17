import scanReport from './scan-report'
import rulesReport from './rules-report'

const enum scanResult {
  pass = 'pass',
  fail = 'fail',
  warn = 'warn',
}

const enum scanDataType {
  status = 'status',
  count = 'count',
}

export { rulesReport, scanReport, scanResult, scanDataType }
