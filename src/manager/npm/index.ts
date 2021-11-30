import { exec } from 'child_process'
import path from 'path'

export default class NpmManager {
  constructor() {
    this.npmBinary = './node_modules/.bin/npm'
  }

  npmBinary: string

  getProviderImportPath(provider: string): {
    importPath: string
    name: string
  } {
    let providerNamespace = '@cloudgraph'
    let providerName = provider
    if (provider.includes('/')) {
      [providerNamespace, providerName] = provider.split('/')
    }
    return {
      importPath: `${providerNamespace}/cg-provider-${providerName}`,
      name: providerName,
    }
  }

  async install(_path: string, version?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const module = `${_path}${version ? `@${version}` : ''}`

      const flags = [
        '--no-audit',
        '--no-fund',
        '--no-save',
        '--ignore-scripts',
        '--silent',
      ]
      exec(
        `${this.npmBinary} install ${module} ${flags.join(' ')}`,
        { cwd: path.resolve(__dirname, '../../../') },

        err => {
          if (err) return reject(err)
          resolve(0)
        }
      )
    })
  }

  async uninstall(_path: string, version?: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const module = `${_path}${version ? `@${version}` : ''}`

      const flags = [
        '--no-audit',
        '--no-fund',
        '--no-save',
        '--ignore-scripts',
        '--silent',
      ]
      exec(
        `${this.npmBinary} uninstall ${module} ${flags.join(' ')}`,
        { cwd: path.resolve(__dirname, '../../../') },
        err => {
          if (err) return reject(err)

          resolve(0)
        }
      )
    })
  }

  async queryPackage(module: string): Promise<any> {
    return new Promise((resolve, reject) => {
      exec(
        `${this.npmBinary} view ${module} --json`,
        { cwd: path.resolve(__dirname, '../../../') },
        (err, stdout) => {
          if (err) return reject(err)

          const res = JSON.parse(stdout)
          resolve(res)
        }
      )
    })
  }
}
