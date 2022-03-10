#!/usr/bin/env node

const fs = require('fs')
const execa = require('execa')
const https = require('https')
const path = require('path')
const rm = require('rimraf')
const mkdirp = require('mkdirp')
const { promisify } = require('util')
const { pipeline } = require('stream')
const crypto = require('crypto')
const AWS = require('aws-sdk')

const NODE_JS_BASE = 'https://nodejs.org/download/release'
const CLI_DIR = path.join(__dirname, '..', '..')
const DIST_DIR = path.join(CLI_DIR, 'dist')
const PJSON = require(path.join(CLI_DIR, 'package.json'))
const NODE_VERSION = PJSON.oclif.update.node.version
const SHORT_VERSION = PJSON.version
const pathToDist = path.join(DIST_DIR, `cg-v${SHORT_VERSION}`)
async function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let buffer = []

        res.on('data', buf => {
          buffer.push(buf)
        })

        res.on('close', () => {
          resolve(Buffer.concat(buffer).toString('utf-8'))
        })
      })
      .on('error', reject)
  })
}

async function getDownloadInfoForNodeVersion(version) {
  // https://nodejs.org/download/release/v12.21.0/SHASUMS256.txt
  const url = `${NODE_JS_BASE}/v${version}/SHASUMS256.txt`
  const shasums = await getText(url)
  const shasumLine = shasums.split('\n').find(line => {
    return line.includes(`node-v${version}-darwin-x64.tar.xz`)
  })

  if (!shasumLine) {
    throw new Error(`could not find matching shasum for ${version}`)
  }

  const [shasum, filename] = shasumLine.trim().split(/\s+/)
  return {
    url: `${NODE_JS_BASE}/v${version}/${filename}`,
    sha256: shasum,
  }
}

async function calculateSHA256(fileName) {
  const hash = crypto.createHash('sha256')
  hash.setEncoding('hex')
  await promisify(pipeline)(fs.createReadStream(fileName), hash)
  return hash.read()
}

async function uploadToS3(file) {
  console.log(`Uploading ${file} to S3`)
  await new Promise((resolve, reject) => {
    const pathToFile = path.join(pathToDist, file)
    const fileStream = fs.createReadStream(pathToFile)
    fileStream.on('error', err => {
      if (err) {
        reject(err)
      }
    })
    fileStream.on('open', () => {
      const credentials = new AWS.SharedIniFileCredentials({
        profile: 'cloudgraph-iac',
        callback: err => {
          if (err) {
            console.log('No credentials found for profile cloudgraph-iac')
            console.log(err)
          }
        },
      })
      sts = new AWS.STS()
      const { roleArn } = credentials
      const options = {
        RoleSessionName: 'CloudGraph-IAC',
        RoleArn: roleArn,
      }
      console.log(options)
      sts.assumeRole(options, (err, data) => {
        if (err) {
          console.log(`No valid credentials found for roleARN: ${roleArn}`)
          console.log(err)
          reject(err)
        } else {
          // successful response
          console.log('successfully got access keys from role')
          const {
            AccessKeyId: accessKeyId,
            SecretAccessKey: secretAccessKey,
            SessionToken: sessionToken,
          } = data.Credentials
          const creds = {
            accessKeyId,
            secretAccessKey,
            sessionToken,
          }
          const S3 = new AWS.S3({ credentials: creds })
          S3.putObject(
            {
              Bucket: PJSON.oclif.update.s3.bucket,
              Key: `cg-v${SHORT_VERSION}/${file}`,
              Body: fileStream,
              ServerSideEncryption: 'AES256',
              ACL: 'bucket-owner-full-control',
            },
            err => {
              if (err) {
                reject(err)
              }
            }
          )
          resolve()
        }
      })
    })
  })
}

function getFilesByOS(os) {
  const files = fs.readdirSync(pathToDist)
  return files.filter(file => file.includes(os) && !file.includes('.xz'))
}

const ROOT = path.join(__dirname, '..')
const TEMPLATES = path.join(ROOT, 'templates')

const CLI_ASSETS_URL =
  process.env.CLI_ASSETS_URL || 'https://cli-assets.cloudgraph.dev'

async function updateCgFormula(brewDir) {
  const templatePath = path.join(TEMPLATES, 'cg.rb')
  const template = fs.readFileSync(templatePath).toString('utf-8')
  const files = getFilesByOS('darwin-x64')
  const zipFile = files.find(file => file.includes('tar.gz'))
  const pathToFile = path.join(pathToDist, zipFile)
  const sha256 = await calculateSHA256(pathToFile)
  const url = `${CLI_ASSETS_URL}/cg-v${SHORT_VERSION}/${zipFile}`

  const templateReplaced = template
    .replace('__VERSION__', SHORT_VERSION)
    .replace('__CLI_DOWNLOAD_URL__', url)
    .replace('__TARBALL_HASH__', sha256)
    .replace('__NODE_VERSION__', NODE_VERSION)

  fs.writeFileSync(path.join(brewDir, 'cg.rb'), templateReplaced)
  if (process.env.WRITE_TO_S3 === undefined) {
    files.forEach(async file => {
      await uploadToS3(file)
    })
  }
}

async function updateCgNodeFormula(brewDir) {
  const formulaPath = path.join(brewDir, 'cg-node.rb')

  console.log(`updating CloudGraph-node Formula in ${formulaPath}`)
  console.log(`getting SHA and URL for Node.js version ${NODE_VERSION}`)

  const { url, sha256 } = await getDownloadInfoForNodeVersion(NODE_VERSION)

  console.log(`done getting SHA for Node.js version ${NODE_VERSION}: ${sha256}`)
  console.log(`done getting URL for Node.js version ${NODE_VERSION}: ${url}`)

  const templatePath = path.join(TEMPLATES, 'cg-node.rb')
  const template = fs.readFileSync(templatePath).toString('utf-8')

  const templateReplaced = template
    .replace('__NODE_BIN_URL__', url)
    .replace('__NODE_SHA256__', sha256)
    .replace('__NODE_VERSION__', NODE_VERSION)

  fs.writeFileSync(formulaPath, templateReplaced)
  console.log(`done updating cg-node Formula in ${formulaPath}`)
}

async function setupGit() {
  const githubSetupPath = path.join(__dirname, '_github_setup')
  await execa(githubSetupPath)
}

async function updateHomebrew() {
  const tmp = path.join(__dirname, 'tmp')
  const homebrewDir = path.join(tmp, 'homebrew-tap')
  mkdirp.sync(tmp)
  rm.sync(homebrewDir)

  // await setupGit()

  console.log(
    `cloning https://github.com/cloudgraphdev/homebrew-tap to ${homebrewDir}`
  )
  await execa('git', [
    'clone',
    'git@github.com:cloudgraphdev/homebrew-tap.git',
    homebrewDir,
  ])
  console.log(`done cloning cloudgraphdev/homebrew-tap to ${homebrewDir}`)

  console.log('updating local git...')
  await updateCgNodeFormula(homebrewDir)
  await updateCgFormula(homebrewDir).catch(err => {
    throw new Error(err)
  })

  // run in git in cloned cloudgraph/homebrew-tap git directory
  const git = async (args, opts = {}) => {
    await execa('git', ['-C', homebrewDir, ...args], opts)
  }
  try {
    await git(['add', '.'])
    await git(['config', '--local', 'core.pager', 'cat'])
    await git(['diff', '--cached'], { stdio: 'inherit' })
    await git(['commit', '-m', `CloudGraph v${SHORT_VERSION}`])
    if (process.env.SKIP_GIT_PUSH === undefined) {
      await git(['push', 'origin', 'main'])
    }
  } catch (e) {
    console.log('Error attempting to update git repo')
    console.log(e)
  }
}

updateHomebrew().catch(err => {
  console.error(`error running scripts/release/homebrew.js`, err)
  process.exit(1)
})
