import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import brotli from "rollup-plugin-brotli";
import pkg from './package.json';

export default [{
  input: 'dist/index.js',
  output: {
    name: "Ajax",
    file: pkg.browser,
    format: 'iife',
    sourcemap: 'inline',
  },
  plugins: [
    resolve(),
    commonjs(),
    brotli()
  ],
}];