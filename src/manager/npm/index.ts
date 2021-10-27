import { exec } from 'child_process'

export default class NpmManager {
  constructor() {
    this.npmBinary =
      process.env.NODE_ENV === 'test' ? './node_modules/.bin/npm' : 'npm'
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

  async install(_path: string, version?: string) {
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

        err => {
          if (err) reject(err)
          resolve(0)
        }
      )
    })
  }

  async uninstall(_path: string, version?: string) {
    return new Promise((resolve, reject) => {
      const module = `${_path}${version ? `@${version}` : ''}`

      const flags = [
        '--no-audit',
        '--no-fund',
        '--no-save',
        '--ignore-scripts',
        '--silent',
      ]
      exec(`${this.npmBinary} uninstall ${module} ${flags.join(' ')}`, err => {
        if (err) reject(err)

        resolve(0)
      })
    })
  }

  async queryPackage(module: string): Promise<any> {
    return new Promise((resolve, reject) => {
      exec(`${this.npmBinary} view ${module} --json`, (err, stdout) => {
        if (err) reject(err)

        const res = JSON.parse(stdout)
        resolve(res)
      })
    })
  }
}
