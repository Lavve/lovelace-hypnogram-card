import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: ['src/hypnogram-card.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: false,
  },
  plugins: [nodeResolve(), typescript()],
}
