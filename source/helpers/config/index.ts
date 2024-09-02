
import * as pkg from '../../../package.json'

export const config = {
  version: pkg.version,
  apiPort: parseInt(process.env.API_PORT!),
  debugLog: process.env.DEBUG_LOG === 'true',
  datasourceUrl: process.env.DATASOURCE_URL,
  oauth2GithubSecret: process.env.OAUTH2_GITHUB_SECRET,
  oauth2GithubClientId: process.env.OAUTH2_GITHUB_CLIENT_ID,
}
