import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel'
import { terser } from "rollup-plugin-terser";
import visualizer from 'rollup-plugin-visualizer';
const path = require('path')

export default {
  input: './src/index.js',
  output: {
    file:"./dist/minimap.min.js",
    format:"umd",
    name: 'minimap'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel(),
    visualizer(),
    terser()
  ]
}