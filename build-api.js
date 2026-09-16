import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

await build({
  entryPoints: [__dirname + '/backend/handler.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: __dirname + '/api/index.js',
  allowOverwrite: true,
  packages: 'external',
  treeShaking: true,
})
console.log('✅ api/index.js bundled')
