import childProcess, { ChildProcess } from 'child_process'
import open from 'open'

const openBrowser = (url: string): Promise<void | ChildProcess> => {
  // Skip opening browser while testing
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve()
  }
  if (process.platform === 'darwin') {
    // Will use the first open browser found from list
    const supportedChromiumBrowsers = [
      'Google Chrome Canary',
      'Google Chrome',
      'Microsoft Edge',
      'Brave Browser',
      'Vivaldi',
      'Chromium',
    ]

    for (const chromiumBrowser of supportedChromiumBrowsers) {
      try {
        // Find root directory
        const directory = __dirname.split('/').slice(0, -1)
        // Try our best to reuse existing tab
        // on OSX Chromium-based browser with AppleScript
        childProcess.execSync(`ps cax | grep "${chromiumBrowser}"`)
        childProcess.execSync(
          `osascript openChrome.applescript "${encodeURI(
            url
          )}" "${chromiumBrowser}"`,
          {
            cwd: `${directory.join('/')}/scripts/`,
            stdio: 'ignore',
          }
        )
        return new Promise(() => {
          // Keep the process active
        })
      } catch (error) {
        // Ignore commands errors.
      }
    }
  }

  // Fallback to open
  // (It will always open new tab)
  return open(url, { wait: true })
}

export default openBrowser
