import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';

export default {
  plugins: [
    babel({
      presets: [
        [
          'env',
          {
            targets: { node: 'current' },
            modules: false
          }
        ]
      ],
      plugins: [
        ['transform-object-rest-spread', { useBuiltIns: true }],
        'transform-flow-strip-types',
        'external-helpers'
      ],
      babelrc: false
    }),
    nodeResolve({ jsnext: true, main: true, preferBuiltins: true }),
    commonjs(),
    cleanup()
  ],
  sourceMap: true,
  format: 'cjs',
  external: ['http', 'util', 'events', 'string_decoder', 'cluster', 'fs']
};
