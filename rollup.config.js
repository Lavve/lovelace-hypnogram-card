import path from 'node:path'
import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  input: ['src/hypnogram-card.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: false,
  },
  plugins: [
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    }),
    nodeResolve(),
    typescript(),
  ],
}
