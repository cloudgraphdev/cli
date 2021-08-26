import childProcess, { ChildProcess } from 'child_process'
import open from 'open'

const openBrowser = (url: string): Promise<void | ChildProcess> => {
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
        // Try our best to reuse existing tab
        // on OSX Chromium-based browser with AppleScript
        childProcess.execSync(`ps cax | grep "${chromiumBrowser}"`)
        childProcess.execSync(
          `osascript openChrome.applescript "${encodeURI(
            url
          )}" "${chromiumBrowser}"`,
          {
            cwd: `${__dirname}/scripts/`,
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
